import { openingHours, site } from "@/data/site";
import type { DayKey, OpeningHoursRule } from "@/lib/types";

/** Urutan sesuai `Date.getDay()`: 0 = Minggu. */
const DAY_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Senin",
  tue: "Selasa",
  wed: "Rabu",
  thu: "Kamis",
  fri: "Jumat",
  sat: "Sabtu",
  sun: "Minggu",
};

const SCHEMA_DAYS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const MINUTES_PER_DAY = 24 * 60;

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** "08:00" → "08.00" (penulisan jam dalam Bahasa Indonesia). */
export function formatTime(time: string): string {
  return time.replace(":", ".");
}

export function formatRange(rule: Pick<OpeningHoursRule, "open" | "close">): string {
  return `${formatTime(rule.open)}–${formatTime(rule.close)}`;
}

export function getRuleForDay(
  day: DayKey,
  rules: OpeningHoursRule[] = openingHours,
): OpeningHoursRule | undefined {
  return rules.find((rule) => rule.days.includes(day));
}

/** `true` bila setiap hari dalam seminggu punya jam buka. */
export function isOpenEveryDay(rules: OpeningHoursRule[] = openingHours): boolean {
  return DAY_KEYS.every((day) => getRuleForDay(day, rules));
}

/**
 * Ringkasan jam buka satu baris, mis. "08.00–22.00, Sabtu–Minggu sampai 23.00".
 * Jika ada hari libur: "Senin–Jumat 08.00–22.00, Sabtu 09.00–15.00".
 */
export function hoursSummary(rules: OpeningHoursRule[] = openingHours): string {
  const [first, ...rest] = rules;
  if (!first) return "";
  if (!isOpenEveryDay(rules)) return rules.map((r) => `${r.label} ${formatRange(r)}`).join(", ");
  const others = rest.map((r) =>
    r.open === first.open
      ? `${r.label} sampai ${formatTime(r.close)}`
      : `${r.label} ${formatRange(r)}`,
  );
  return [formatRange(first), ...others].join(", ");
}

/** "Tutup pukul 22.00" → "tutup pukul 22.00" */
export function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Hari dan menit saat ini di zona waktu kafe (default Asia/Jakarta). */
export function getZonedNow(date: Date, timeZone: string = site.timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    dayIndex,
    day: DAY_KEYS[dayIndex],
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

type Interval = { start: number; end: number; rule: OpeningHoursRule };

/** Rentang buka untuk hari ke-`offset` dari hari ini, dalam menit relatif terhadap 00.00 hari ini. */
function intervalFor(dayIndex: number, offset: number, rules: OpeningHoursRule[]): Interval | null {
  const day = DAY_KEYS[(((dayIndex + offset) % 7) + 7) % 7];
  const rule = getRuleForDay(day, rules);
  if (!rule) return null;
  const open = toMinutes(rule.open);
  let close = toMinutes(rule.close);
  if (close <= open) close += MINUTES_PER_DAY; // tutup lewat tengah malam
  const base = offset * MINUTES_PER_DAY;
  return { start: base + open, end: base + close, rule };
}

export type OpenStatus = {
  isOpen: boolean;
  /** Jam buka hari ini, atau `undefined` jika libur. */
  today?: OpeningHoursRule;
  /** Kalimat pendek, mis. "Tutup pukul 22.00" atau "Buka besok pukul 08.00". */
  detail: string;
};

export function getOpenStatus(
  date: Date,
  rules: OpeningHoursRule[] = openingHours,
  timeZone: string = site.timeZone,
): OpenStatus {
  const { dayIndex, day, minutes } = getZonedNow(date, timeZone);
  const today = getRuleForDay(day, rules);

  // Kemarin (bisa masih buka lewat tengah malam) dan hari ini.
  for (const offset of [-1, 0]) {
    const interval = intervalFor(dayIndex, offset, rules);
    if (interval && minutes >= interval.start && minutes < interval.end) {
      const closesAt = formatTime(interval.rule.close);
      const closesTomorrow = interval.end > MINUTES_PER_DAY && offset === 0;
      return {
        isOpen: true,
        today,
        detail: closesTomorrow ? `Tutup besok pukul ${closesAt}` : `Tutup pukul ${closesAt}`,
      };
    }
  }

  for (let offset = 0; offset <= 7; offset++) {
    const interval = intervalFor(dayIndex, offset, rules);
    if (!interval || interval.start <= minutes) continue;
    const opensAt = formatTime(interval.rule.open);
    const when =
      offset === 0
        ? ""
        : offset === 1
          ? "besok "
          : `${DAY_LABELS[DAY_KEYS[(dayIndex + offset) % 7]]} `;
    return { isOpen: false, today, detail: `Buka ${when}pukul ${opensAt}` };
  }

  return { isOpen: false, today, detail: "Sementara tutup" };
}

/** Untuk JSON-LD (schema.org OpeningHoursSpecification). */
export function toSchemaOpeningHours(rules: OpeningHoursRule[] = openingHours) {
  return rules.map((rule) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: rule.days.map((d) => SCHEMA_DAYS[d]),
    opens: rule.open,
    closes: rule.close,
  }));
}

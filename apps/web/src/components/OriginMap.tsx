"use client";

import { useState } from "react";

type Origin = {
  id: string;
  name: string;
  region: string;
  notes: string;
  varietal: string;
  process: string;
  altitude: string;
  // SVG coords (rough Indonesia outline 0-1000 wide x 0-440 tall)
  x: number;
  y: number;
};

const ORIGINS: Origin[] = [
  {
    id: "gayo",
    name: "Aceh Gayo",
    region: "Takengon, Aceh",
    notes: "earthy, herbal, woody",
    varietal: "Tim-Tim, Bourgon",
    process: "Wet-hulled (giling basah)",
    altitude: "1.200 – 1.700 mdpl",
    x: 130,
    y: 120,
  },
  {
    id: "mandheling",
    name: "Sumatra Mandheling",
    region: "Lintong, Sumut",
    notes: "smoky, dark chocolate, cedar",
    varietal: "Lintong, Catimor",
    process: "Wet-hulled",
    altitude: "1.100 – 1.500 mdpl",
    x: 220,
    y: 175,
  },
  {
    id: "preanger",
    name: "Java Preanger",
    region: "Garut, Jabar",
    notes: "tea-like, jasmine, light caramel",
    varietal: "Sigararutang, Lini-S",
    process: "Honey",
    altitude: "1.300 – 1.500 mdpl",
    x: 410,
    y: 305,
  },
  {
    id: "kintamani",
    name: "Bali Kintamani",
    region: "Kintamani, Bali",
    notes: "citrusy, orange peel, sweet",
    varietal: "Bourbon",
    process: "Washed",
    altitude: "1.200 – 1.600 mdpl",
    x: 555,
    y: 320,
  },
  {
    id: "flores",
    name: "Flores Bajawa",
    region: "Bajawa, NTT",
    notes: "floral, bergamot, hazelnut",
    varietal: "Catimor, Typica",
    process: "Washed",
    altitude: "1.200 – 1.500 mdpl",
    x: 660,
    y: 330,
  },
  {
    id: "toraja",
    name: "Toraja",
    region: "Tana Toraja, Sulsel",
    notes: "spicy, dark cherry, syrupy",
    varietal: "Typica, Lini-S",
    process: "Wet-hulled",
    altitude: "1.400 – 1.800 mdpl",
    x: 605,
    y: 230,
  },
  {
    id: "wamena",
    name: "Papua Wamena",
    region: "Lembah Baliem, Papua",
    notes: "winey, tropical fruit, complex",
    varietal: "Typica",
    process: "Washed",
    altitude: "1.500 – 2.000 mdpl",
    x: 880,
    y: 295,
  },
];

export function OriginMap() {
  const [active, setActive] = useState<string>("toraja");
  const sel = ORIGINS.find((o) => o.id === active) ?? ORIGINS[0];

  return (
    <div className="rounded-3xl border border-ink/20 bg-paper p-6 grid lg:grid-cols-[1fr_280px] gap-6 items-start">
      <div className="aspect-[1000/440] w-full rounded-2xl bg-cream border border-ink/10 relative overflow-hidden">
        <svg
          viewBox="0 0 1000 440"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
        >
          {/* simplified Indonesia archipelago shapes */}
          <g fill="#e07a3c22" stroke="#5b1a1466" strokeWidth="1.2">
            <ellipse cx="170" cy="180" rx="120" ry="35" transform="rotate(-25 170 180)" />
            <ellipse cx="430" cy="310" rx="180" ry="20" />
            <ellipse cx="555" cy="320" rx="35" ry="14" />
            <ellipse cx="660" cy="335" rx="80" ry="18" />
            <ellipse cx="610" cy="245" rx="80" ry="60" />
            <ellipse cx="870" cy="295" rx="90" ry="60" />
            <ellipse cx="780" cy="220" rx="50" ry="32" />
          </g>
          {ORIGINS.map((o) => (
            <g
              key={o.id}
              onClick={() => setActive(o.id)}
              className="cursor-pointer"
            >
              <circle
                cx={o.x}
                cy={o.y}
                r={active === o.id ? 12 : 8}
                fill={active === o.id ? "#e07a3c" : "#5b1a14"}
                className="transition-all"
              />
              {active === o.id && (
                <circle
                  cx={o.x}
                  cy={o.y}
                  r="22"
                  fill="none"
                  stroke="#e07a3c"
                  strokeWidth="2"
                  opacity="0.6"
                  className="origin-pulse"
                  style={{ transformOrigin: `${o.x}px ${o.y}px` }}
                />
              )}
              <text
                x={o.x}
                y={o.y - 16}
                fontSize="14"
                fontFamily="ui-serif,serif"
                fontStyle="italic"
                fill="#5b1a14"
                textAnchor="middle"
                className="select-none"
              >
                {o.name}
              </text>
            </g>
          ))}
        </svg>
        <style jsx>{`
          .origin-pulse {
            animation: tr-pulse 1.6s ease-out infinite;
          }
          @keyframes tr-pulse {
            0% { transform: scale(0.6); opacity: 0.7; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}</style>
      </div>

      <aside className="rounded-2xl border border-ink/20 bg-cream p-5">
        <p className="font-mono text-xs opacity-60 lowercase">{sel.region}</p>
        <h3 className="font-serif italic text-2xl mt-1">{sel.name}</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest opacity-60">
              catatan rasa
            </dt>
            <dd>{sel.notes}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest opacity-60">
              varietas
            </dt>
            <dd>{sel.varietal}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest opacity-60">
              proses
            </dt>
            <dd>{sel.process}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest opacity-60">
              ketinggian
            </dt>
            <dd>{sel.altitude}</dd>
          </div>
        </dl>
        <p className="text-xs font-mono opacity-50 mt-4">
          klik titik di peta untuk pindah origin.
        </p>
      </aside>
    </div>
  );
}

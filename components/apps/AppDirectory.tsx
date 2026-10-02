"use client";

import Image from "next/image";
import { useState } from "react";

const apps = [
  {
    id: "simplifytrabaho",
    name: "SimplifyTrabaho",
    url: "https://simplifytrabaho.ycells.com",
    description:
      "Find jobs, internships, and OJT opportunities in the Philippines. Apply directly through each company's official careers page.",
  },
  {
    id: "unisort",
    name: "UniSort",
    url: "https://unisort.ycells.com",
    description:
      "Find your university fit among the Philippines' Big Four. Explore campus culture, take the personality quiz, and read student stories.",
  },
  {
    id: "airosu",
    name: "airosu",
    url: "https://airosu.ycells.com",
    description:
      "Play osu! beatmaps with your hand and a webcam. Bring your favorite maps and move to the rhythm.",
  },
] as const;

type AppId = (typeof apps)[number]["id"];

function AppLogo({ id }: { id: AppId }) {
  if (id === "simplifytrabaho") {
    return (
      <Image
        className="briefcase-logo"
        src="/logos/simplifytrabaho.png"
        width={120}
        height={120}
        alt=""
      />
    );
  }
  if (id === "unisort") {
    return (
      <span className="unisort-logo" aria-hidden="true">
        UNI<span>S</span>
        <span>O</span>
        <span>R</span>
        <span>T</span>
      </span>
    );
  }
  return (
    <span className="airosu-logo" aria-hidden="true">
      airosu!
    </span>
  );
}

export default function AppDirectory() {
  const [selectedId, setSelectedId] = useState<AppId | null>(null);
  const selected = apps.find((app) => app.id === selectedId);

  return (
    <main className="app-stage">
      <h1 className="sr-only">ycells apps</h1>
      <div className="app-directory" data-selected={Boolean(selected)}>
        <nav className="app-list" aria-label="Apps">
          {apps.map((app) => (
            <button
              key={app.id}
              type="button"
              aria-pressed={selectedId === app.id}
              onClick={() =>
                setSelectedId(selectedId === app.id ? null : app.id)
              }
            >
              {app.name}
            </button>
          ))}
        </nav>
        {selected ? (
          <section
            key={selected.id}
            className="app-details"
            aria-label={`About ${selected.name}`}
          >
            <a
              className="app-logo-link"
              href={selected.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${selected.name} in a new tab`}
              title={`Open ${selected.name}`}
            >
              <AppLogo id={selected.id} />
            </a>
            <p>{selected.description}</p>
          </section>
        ) : null}
      </div>
    </main>
  );
}

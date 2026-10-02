"use client";

import Image from "next/image";
import { useState } from "react";

const apps = [
  {
    id: "simplifytrabaho",
    name: "SimplifyTrabaho",
    url: "https://simplifytrabaho.ycells.com",
    github: "https://github.com/yanicells/simplifytrabaho",
    image: {
      src: "/apps/simplifytrabaho.png",
      width: 2200,
      height: 1138,
      alt: "SimplifyTrabaho's smiling briefcase logo and wordmark",
    },
    description:
      "A place to find jobs, internships, and OJT opportunities in the Philippines. Browse by location and work setup to find something that fits. Each listing takes you directly to the company's official careers page to apply.",
  },
  {
    id: "unisort",
    name: "UniSort",
    url: "https://unisort.ycells.com",
    github: "https://github.com/yanicells/unisort",
    image: {
      src: "/apps/unisort.png",
      width: 2062,
      height: 1492,
      alt: "UniSort's newspaper-style homepage and university match results",
    },
    description:
      "A personality quiz to help you explore your fit among the Philippines' Big Four universities. Get a feel for each campus through student stories and a shared freedom wall. It's a playful way to imagine where you might feel at home.",
  },
  {
    id: "airosu",
    name: "airosu",
    url: "https://airosu.ycells.com",
    github: "https://github.com/yanicells/airosu",
    image: {
      src: "/apps/airosu.png",
      width: 2468,
      height: 1404,
      alt: "airosu's pink logo and colorful rhythm game menu",
    },
    description:
      "Play osu! beatmaps using your hand and a webcam. Bring your favorite maps, set up a comfortable play area, and move to the rhythm. Sign in with osu! to share your scores and climb the leaderboard.",
  },
] as const;

type ViewId = "about" | (typeof apps)[number]["id"];

export default function AppDirectory() {
  const [selectedId, setSelectedId] = useState<ViewId>("about");
  const selected = apps.find((app) => app.id === selectedId);

  return (
    <main className="app-stage">
      <h1 className="sr-only">ycells</h1>
      <div className="app-directory">
        <nav className="app-list" aria-label="About and apps">
          <button
            type="button"
            aria-pressed={selectedId === "about"}
            onClick={() => setSelectedId("about")}
          >
            About
          </button>
          {apps.map((app) => (
            <button
              key={app.id}
              type="button"
              aria-pressed={selectedId === app.id}
              onClick={() => setSelectedId(app.id)}
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
            <Image
              className="app-image"
              src={selected.image.src}
              width={selected.image.width}
              height={selected.image.height}
              alt={selected.image.alt}
              sizes="(max-width: 580px) 55vw, (max-width: 900px) 420px, 480px"
            />
            <div className="app-links">
              <a href={selected.url} target="_blank" rel="noopener noreferrer">
                Open app <span aria-hidden="true">↗</span>
              </a>
              <a
                href={selected.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
            <p>{selected.description}</p>
          </section>
        ) : (
          <section
            key="about"
            className="app-details about-details"
            aria-label="About"
          >
            <p>
              Software development is my way of expressing my creativity.
              Growing up, I was more drawn to maths and sciences than creative
              pursuits, so I didn&apos;t really think of myself as a creative
              person. Through software, I&apos;ve found a soft intersection
              between the two.
            </p>
            <p>I hope you like my work!</p>
            <div className="app-links">
              <a
                href="https://github.com/yanicells"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

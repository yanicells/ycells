export type ProjectId = "simplifytrabaho" | "unisort" | "airosu";

export type Track = {
  title: string;
  feature: string;
  description: string;
  path: string;
};

export type Album = {
  id: ProjectId;
  name: string;
  title: string;
  category: string;
  catalogNumber: string;
  color: string;
  ink: string;
  artwork: string;
  artworkAlt: string;
  url: string;
  description: string;
  tempo: number;
  notes: readonly number[];
  tracks: readonly Track[];
};

// Album copy and destinations come from the three projects' local source.
export const albums: readonly Album[] = [
  {
    id: "simplifytrabaho",
    name: "SimplifyTrabaho",
    title: "The next chapter",
    category: "For your next move",
    catalogNumber: "YC–001",
    color: "#a6cbd9",
    ink: "#3d667b",
    artwork: "/records/simplifytrabaho.webp",
    artworkAlt: "Translucent blue glass steps rising above a sunlit sea",
    url: "https://simplifytrabaho.ycells.com",
    description:
      "A clearer way to find jobs and internships in the Philippines.",
    tempo: 78,
    notes: [60, 64, 67, 71, 74, 67, 64, 62],
    tracks: [
      {
        title: "A fresh start",
        feature: "Find your next role",
        description:
          "Explore jobs at companies hiring in the Philippines, across roles and experience levels.",
        path: "/",
      },
      {
        title: "Closer to home",
        feature: "Find your kind of workplace",
        description:
          "Narrow the search by location and work setup, including remote, hybrid, and on-site roles.",
        path: "/",
      },
      {
        title: "Room to grow",
        feature: "Start somewhere good",
        description:
          "Find internships, OJT opportunities, and fresh graduate roles for the beginning of your career.",
        path: "/",
      },
      {
        title: "Straight to the source",
        feature: "Apply with the company",
        description:
          "Every application leads to the company's official careers page. Listings come from public company hiring systems.",
        path: "/",
      },
    ],
  },
  {
    id: "unisort",
    name: "UniSort",
    title: "Somewhere you belong",
    category: "For finding your people",
    catalogNumber: "YC–002",
    color: "#dbb271",
    ink: "#916a32",
    artwork: "/records/unisort.webp",
    artworkAlt: "Four sculptural clay doorways in warm afternoon light",
    url: "https://unisort.ycells.com",
    description: "Find your university fit among the Philippines' Big Four.",
    tempo: 88,
    notes: [57, 60, 64, 67, 64, 60, 62, 65],
    tracks: [
      {
        title: "Find your people",
        feature: "Meet your university match",
        description:
          "Take a personality quiz to explore how you fit with Ateneo, La Salle, UP, and UST campus culture.",
        path: "/quiz",
      },
      {
        title: "Four different worlds",
        feature: "Get to know the Big Four",
        description:
          "Explore university cultures and compare the different places you could call home.",
        path: "/big4",
      },
      {
        title: "Off the record",
        feature: "Read the freedom wall",
        description:
          "An anonymous space for campus confessions, hot takes, and student stories.",
        path: "/freedom-wall",
      },
      {
        title: "The bigger picture",
        feature: "See where everyone lands",
        description:
          "Explore the community's university matches and personality distributions in the live stats.",
        path: "/stats",
      },
    ],
  },
  {
    id: "airosu",
    name: "airosu",
    title: "Hands in the air",
    category: "For the love of rhythm",
    catalogNumber: "YC–003",
    color: "#d4a3bf",
    ink: "#975875",
    artwork: "/records/airosu.webp",
    artworkAlt: "A flowing pink ribbon orbiting a polished chrome sphere",
    url: "https://airosu.ycells.com",
    description: "Play osu! beatmaps with your hand and a webcam.",
    tempo: 112,
    notes: [62, 69, 74, 65, 72, 69, 67, 74],
    tracks: [
      {
        title: "Hands in the air",
        feature: "Turn movement into play",
        description:
          "Aim with your palm or index fingertip. Your webcam turns hand movements into a rhythm-game cursor.",
        path: "/",
      },
      {
        title: "Your own rhythm",
        feature: "Bring your favorite beatmaps",
        description:
          "Drop in an osu! .osz beatmap and choose a difficulty. Imported maps stay in your browser.",
        path: "/",
      },
      {
        title: "Set the stage",
        feature: "Make room to move",
        description:
          "Calibrate a comfortable aim area, choose your hand-tracking mode, and play with auto-tap or manual controls.",
        path: "/",
      },
      {
        title: "One more run",
        feature: "Climb the leaderboard",
        description:
          "Optionally sign in with osu! to submit scores, earn airosu pp, and explore online leaderboards.",
        path: "/leaderboard",
      },
    ],
  },
];

export const PREVIEW_SECONDS = 30;

import type { SVGProps } from "react";

type IconName =
  | "play"
  | "pause"
  | "previous"
  | "next"
  | "volume"
  | "muted"
  | "arrow"
  | "close"
  | "flip";
type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

const paths: Record<IconName, React.ReactNode> = {
  play: <path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <path d="M8 5v14M16 5v14" strokeWidth="4" />
    </>
  ),
  previous: (
    <>
      <path d="M6 5v14" />
      <path d="m18 5-10 7 10 7Z" fill="currentColor" stroke="none" />
    </>
  ),
  next: (
    <>
      <path d="M18 5v14" />
      <path d="m6 5 10 7-10 7Z" fill="currentColor" stroke="none" />
    </>
  ),
  volume: (
    <>
      <path d="M11 5 6 9H3v6h3l5 4Z" />
      <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
    </>
  ),
  muted: (
    <>
      <path d="M11 5 6 9H3v6h3l5 4Z" />
      <path d="m16 9 5 6m0-6-5 6" />
    </>
  ),
  arrow: (
    <>
      <path d="M6 18 18 6M7 6h11v11" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  flip: (
    <>
      <path d="M4 8h13l-3-3m3 3-3 3M20 16H7l3 3m-3-3 3-3" />
    </>
  ),
};

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

export function RecordMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="27"
      height="27"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="8.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
      <path
        d="M4 10a14 14 0 0 1 6-6m12 24a14 14 0 0 0 6-6"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}

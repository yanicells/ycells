import Image from "next/image";
import type { ProjectId } from "./catalog";

// Preserve the original briefcase, newspaper wordmark, and airosu cookie identities.
export function ProjectMark({ id }: { id: ProjectId }) {
  if (id === "simplifytrabaho") {
    return (
      <Image
        className="project-mark briefcase-mark"
        src="/records/simplifytrabaho-mark.png"
        alt=""
        width={30}
        height={30}
      />
    );
  }
  if (id === "unisort") {
    return (
      <span className="project-mark unisort-mark" aria-hidden="true">
        UNI<span>S</span>
        <span>O</span>
        <span>R</span>
        <span>T</span>
      </span>
    );
  }
  return (
    <span className="project-mark airosu-mark" aria-hidden="true">
      airosu!
    </span>
  );
}

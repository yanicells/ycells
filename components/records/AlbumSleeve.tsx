import Image from "next/image";
import type { CSSProperties } from "react";
import type { Album } from "./catalog";
import { ProjectMark } from "./ProjectMark";
import { RecordMark } from "./Icons";

type AlbumSleeveProps = {
  album: Album;
  selected: boolean;
  playing: boolean;
  flipped: boolean;
  onSelect: () => void;
};

export function AlbumSleeve({
  album,
  selected,
  playing,
  flipped,
  onSelect,
}: AlbumSleeveProps) {
  const style = {
    "--wax": album.color,
    "--album-ink": album.ink,
  } as CSSProperties;

  return (
    <button
      className="album"
      style={style}
      type="button"
      aria-label={`Select ${album.name} record`}
      aria-pressed={selected}
      onClick={onSelect}
      data-selected={selected}
      data-playing={playing}
      data-flipped={flipped}
    >
      <span className="album-object" aria-hidden="true">
        <span className="vinyl">
          <span className="vinyl-face">
            <span className="vinyl-label">
              <RecordMark />
              <span>{album.name}</span>
              <small>Side A</small>
              <i className="spindle-hole" />
            </span>
          </span>
        </span>
        <span className="sleeve">
          <span className="sleeve-front">
            <span className="sleeve-heading">
              <span className="sleeve-name">
                {album.id === "simplifytrabaho" ? (
                  <>
                    Simplify
                    <br />
                    Trabaho
                  </>
                ) : (
                  album.name
                )}
              </span>
              <ProjectMark id={album.id} />
            </span>
            <span className="sleeve-caption">{album.title}</span>
            <span className="cover-art">
              <Image
                src={album.artwork}
                alt={album.artworkAlt}
                fill
                sizes="(max-width: 580px) 260px, (max-width: 900px) 40vw, 290px"
                priority
              />
            </span>
            <span className="sleeve-side-note">
              Independent software
              <br />
              An original ycells release
            </span>
            <span className="sleeve-imprint">
              <span>{album.catalogNumber}</span>
              <span>ycells recordings</span>
            </span>
          </span>
          <span className="sleeve-back">
            <span className="back-heading">
              <RecordMark />
              <span>{album.name}</span>
            </span>
            <span className="back-title">{album.title}</span>
            <span className="back-tracklist">
              {album.tracks.map((track, index) => (
                <span key={track.title}>
                  <small>A{index + 1}</small>
                  {track.title}
                </span>
              ))}
            </span>
            <span className="back-description">{album.description}</span>
            <span className="sleeve-imprint">
              <span>{album.catalogNumber}</span>
              <span>ycells recordings</span>
            </span>
          </span>
        </span>
      </span>
      <span className="album-meta">
        <span className="album-name">{album.name}</span>
        <span className="album-catalog">{album.catalogNumber}</span>
      </span>
      <span className="album-subtitle">{album.category}</span>
      <span className="album-status">
        <span className="status-dot" />
        {selected ? "On the turntable" : "Put on the turntable"}
      </span>
    </button>
  );
}

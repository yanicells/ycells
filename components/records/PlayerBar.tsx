import Image from "next/image";
import type { CSSProperties, Dispatch } from "react";
import { PREVIEW_SECONDS, type Album } from "./catalog";
import type { PlayerAction, PlayerState } from "./player-state";
import { Icon } from "./Icons";

type PlayerBarProps = {
  album: Album;
  state: PlayerState;
  dispatch: Dispatch<PlayerAction>;
  onSoundToggle: () => void;
};

function time(seconds: number) {
  return `0:${Math.floor(seconds).toString().padStart(2, "0")}`;
}

export function PlayerBar({
  album,
  state,
  dispatch,
  onSoundToggle,
}: PlayerBarProps) {
  const track = album.tracks[state.trackIndex];
  const progress = {
    "--progress": `${(state.elapsed / PREVIEW_SECONDS) * 100}%`,
  } as CSSProperties;

  return (
    <footer className="player-bar" aria-label="Record player">
      <div className="player-inner">
        <div className="player-now">
          <Image src={album.artwork} alt="" width={44} height={44} />
          <span>
            <strong>{track.title}</strong>
            <small>
              {album.name}
              <span className="player-small-separator" />
              Side A
            </small>
          </span>
        </div>
        <div className="transport">
          <div className="transport-buttons">
            <button
              type="button"
              className="icon-button"
              aria-label="Previous track"
              onClick={() => dispatch({ type: "step", direction: -1 })}
            >
              <Icon name="previous" width={17} />
            </button>
            <button
              type="button"
              className="play-button"
              aria-label={state.playing ? "Pause record" : "Play record"}
              onClick={() => dispatch({ type: "play" })}
            >
              <Icon name={state.playing ? "pause" : "play"} width={17} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Next track"
              onClick={() => dispatch({ type: "step", direction: 1 })}
            >
              <Icon name="next" width={17} />
            </button>
          </div>
          <div className="player-progress">
            <span>{time(state.elapsed)}</span>
            <input
              type="range"
              min="0"
              max={PREVIEW_SECONDS}
              step="0.1"
              value={state.elapsed}
              style={progress}
              aria-label="Preview position"
              aria-valuetext={`${Math.floor(state.elapsed)} of ${PREVIEW_SECONDS} seconds`}
              onChange={(event) =>
                dispatch({ type: "seek", seconds: Number(event.target.value) })
              }
            />
            <span>{time(PREVIEW_SECONDS)}</span>
          </div>
        </div>
        <button
          type="button"
          className="sound-button"
          aria-label={state.soundOn ? "Turn sound off" : "Turn sound on"}
          aria-pressed={state.soundOn}
          onClick={onSoundToggle}
        >
          <Icon name={state.soundOn ? "volume" : "muted"} width={18} />
          <span>
            {state.soundOn ? "Sound on" : "Sound off"}
            <small>Original synth loops</small>
          </span>
        </button>
      </div>
    </footer>
  );
}

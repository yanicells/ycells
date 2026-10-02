"use client";

import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { albums } from "./catalog";
import { initialPlayerState, playerReducer } from "./player-state";
import { AlbumSleeve } from "./AlbumSleeve";
import { PlayerBar } from "./PlayerBar";
import { Icon, RecordMark } from "./Icons";
import { RecordSound } from "./sound";
import "./records.css";

export default function RecordCollection() {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const [flipped, setFlipped] = useState(false);
  const [soundError, setSoundError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const sound = useRef<RecordSound | null>(null);
  const elapsed = useRef(state.elapsed);
  const album = albums[state.albumIndex];
  const track = album.tracks[state.trackIndex];

  useEffect(() => {
    elapsed.current = state.elapsed;
  }, [state.elapsed]);

  useEffect(() => {
    if (!state.playing) return;
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      dispatch({ type: "tick", seconds: (now - previous) / 1000 });
      previous = now;
    }, 250);
    return () => clearInterval(timer);
  }, [state.playing]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) dispatch({ type: "pause" });
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () =>
      document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  useEffect(() => {
    const engine = sound.current;
    if (state.playing && state.soundOn && engine) {
      void engine.start(album, state.trackIndex, elapsed.current).catch(() => {
        dispatch({ type: "sound", enabled: false });
        setSoundError("Sound couldn't start. Try turning it on again.");
      });
    } else engine?.stop();
    return () => engine?.stop();
  }, [album, state.trackIndex, state.playing, state.soundOn]);

  useEffect(
    () => () => {
      sound.current?.close();
      sound.current = null;
    },
    [],
  );

  async function toggleSound() {
    if (state.soundOn) {
      dispatch({ type: "sound", enabled: false });
      return;
    }
    try {
      sound.current ??= new RecordSound();
      await sound.current.unlock();
      setSoundError("");
      dispatch({ type: "sound", enabled: true });
    } catch {
      setSoundError(
        "Audio isn't available in this browser. You can still explore every record.",
      );
    }
  }

  function seek(seconds: number) {
    dispatch({ type: "seek", seconds });
    if (state.playing && state.soundOn) {
      void sound.current?.start(album, state.trackIndex, seconds).catch(() => {
        dispatch({ type: "sound", enabled: false });
      });
    }
  }

  return (
    <div
      className="record-store"
      style={{ "--selected-ink": album.ink } as CSSProperties}
    >
      <a className="skip-link" href="#collection">
        Skip to the collection
      </a>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="ycells home">
          <RecordMark />
          <span>
            ycells<span className="wordmark-period">.</span>
          </span>
        </Link>
        <span className="header-note">An independent collection</span>
        <button
          type="button"
          className="liner-button"
          onClick={() => dialog.current?.showModal()}
        >
          Liner notes
          <Icon name="arrow" width={14} />
        </button>
      </header>

      <main id="collection" className="collection-main" tabIndex={-1}>
        <section
          className="collection-intro"
          aria-labelledby="collection-title"
        >
          <div>
            <h1 id="collection-title">Good things on rotation.</h1>
            <p>Useful tools. Playful ideas. A little something for everyone.</p>
          </div>
          <div className="collection-controls">
            <span>Pick a record. Take it for a spin.</span>
            <button
              type="button"
              className="flip-button"
              aria-pressed={flipped}
              onClick={() => setFlipped(!flipped)}
            >
              <Icon name="flip" width={16} />
              {flipped ? "Show the artwork" : "Flip the sleeves"}
            </button>
          </div>
        </section>

        <section className="record-shelf" aria-label="Project albums">
          {albums.map((record, index) => (
            <AlbumSleeve
              key={record.id}
              album={record}
              selected={state.albumIndex === index}
              playing={state.albumIndex === index && state.playing}
              flipped={flipped}
              onSelect={() => dispatch({ type: "album", index })}
            />
          ))}
        </section>

        <section
          className="listening-room"
          aria-label={`${album.name} record details`}
        >
          <div className="record-summary">
            <span className="room-label">
              <span className="playing-indicator" data-playing={state.playing}>
                <i />
                <i />
                <i />
              </span>
              On the turntable
            </span>
            <h2>{album.title}</h2>
            <p>{album.description}</p>
            <span className="record-format">
              {album.catalogNumber}
              <span />4 tracks, one project
            </span>
          </div>
          <div className="track-list">
            <div className="track-list-heading">
              <span>Side A</span>
              <span>The tracklist</span>
            </div>
            {album.tracks.map((item, index) => (
              <button
                type="button"
                className="track"
                key={item.title}
                aria-pressed={index === state.trackIndex}
                onClick={() =>
                  dispatch(
                    index === state.trackIndex
                      ? { type: "play" }
                      : { type: "track", index },
                  )
                }
              >
                <span className="track-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item.title}</span>
                <Icon
                  name={
                    index === state.trackIndex && state.playing
                      ? "pause"
                      : "play"
                  }
                  width={12}
                />
              </button>
            ))}
          </div>
          <div className="track-notes">
            <span className="room-label">Inside this track</span>
            <h3>{track.feature}</h3>
            <p>{track.description}</p>
            <a
              className="project-link"
              href={`${album.url}${track.path}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open {album.name}
              <Icon name="arrow" width={15} />
              <span className="sr-only"> in a new tab</span>
            </a>
          </div>
        </section>

        <div className="collection-footer">
          <span>Three records. No skips.</span>
          <span>Made for the open web.</span>
        </div>
      </main>

      {soundError ? (
        <p className="sound-error" role="status">
          {soundError}
        </p>
      ) : null}
      <PlayerBar
        album={album}
        state={state}
        dispatch={(action) =>
          action.type === "seek" ? seek(action.seconds) : dispatch(action)
        }
        onSoundToggle={() => void toggleSound()}
      />

      <dialog
        className="liner-dialog"
        ref={dialog}
        aria-labelledby="liner-notes-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <button
          type="button"
          className="icon-button dialog-close"
          aria-label="Close liner notes"
          onClick={() => dialog.current?.close()}
        >
          <Icon name="close" />
        </button>
        <RecordMark />
        <h2 id="liner-notes-title">
          A small label.
          <br />A few good releases.
        </h2>
        <p>
          ycells is a collection of independent projects. Some help you find
          your next step. Some help you find your people. Some just get you
          moving.
        </p>
        <p>
          Each project is a record. Its features are the tracks. Pick one,
          explore the sleeve, and follow a track to the real thing.
        </p>
        <small>
          The sounds here are original synth loops, made for this collection.
        </small>
      </dialog>
    </div>
  );
}

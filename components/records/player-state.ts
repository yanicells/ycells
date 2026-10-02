import { albums, PREVIEW_SECONDS } from "./catalog";

export type PlayerState = {
  albumIndex: number;
  trackIndex: number;
  playing: boolean;
  soundOn: boolean;
  elapsed: number;
};

export type PlayerAction =
  | { type: "album"; index: number }
  | { type: "track"; index: number }
  | { type: "step"; direction: -1 | 1 }
  | { type: "play" }
  | { type: "pause" }
  | { type: "sound"; enabled: boolean }
  | { type: "seek"; seconds: number }
  | { type: "tick"; seconds: number };

export const initialPlayerState: PlayerState = {
  albumIndex: 0,
  trackIndex: 0,
  playing: false,
  soundOn: false,
  elapsed: 0,
};

export function playerReducer(
  state: PlayerState,
  action: PlayerAction,
): PlayerState {
  switch (action.type) {
    case "album":
      return state.albumIndex === action.index
        ? { ...state, playing: true }
        : {
            ...state,
            albumIndex: action.index,
            trackIndex: 0,
            elapsed: 0,
            playing: true,
          };
    case "track":
      return { ...state, trackIndex: action.index, elapsed: 0, playing: true };
    case "step": {
      const count = albums[state.albumIndex].tracks.length;
      return {
        ...state,
        trackIndex: (state.trackIndex + action.direction + count) % count,
        elapsed: 0,
      };
    }
    case "play":
      return { ...state, playing: !state.playing };
    case "pause":
      return { ...state, playing: false };
    case "sound":
      return { ...state, soundOn: action.enabled };
    case "seek":
      return {
        ...state,
        elapsed: Math.max(0, Math.min(action.seconds, PREVIEW_SECONDS)),
      };
    case "tick": {
      if (!state.playing) return state;
      const elapsed = state.elapsed + action.seconds;
      if (elapsed < PREVIEW_SECONDS) return { ...state, elapsed };
      return {
        ...state,
        elapsed: elapsed % PREVIEW_SECONDS,
        trackIndex:
          (state.trackIndex + Math.floor(elapsed / PREVIEW_SECONDS)) %
          albums[state.albumIndex].tracks.length,
      };
    }
  }
}

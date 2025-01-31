export interface VideoPlayer {
  isPlaying: boolean;
  isBuffering: boolean;
  isFullScreen: boolean;
  error: string | null;
  currentTime: string;
  duration: string;
  watchedProgress: number;
  bufferProgress: number;
  volume: number;
  isMute: boolean;
  playBackRates: number[];
  currentPlaybackRateIdx: number;
}

export interface VideoBookMark {
  from: number; // in seconds
  to: number; // in seconds
  description: string;
}
export interface ActiveVideoBookMark {
  from: number; // in seconds
  to: number; // in seconds
  description: string;
  isActiveRestriction: boolean;
}

export interface VideoBookmarkUI extends VideoBookMark {
  left: number;
  width: number;
}

import { VideoPlayer } from '../models/video-player.model';

export const pad = (num: number, length: number = 2): string => {
  let str = '' + num;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
};
export const initialVideoPlayerState: VideoPlayer = {
  isPlaying: false,
  isBuffering: false,
  isFullScreen: false,
  error: null,
  currentTime: '00:00',
  duration: '00:00',
  watchedProgress: 0,
  bufferProgress: 0,
  volume: 1,
  isMute: false,
  playBackRates: [1, 1.25, 1.5, 1.75, 2],
  currentPlaybackRateIdx: 0,
};

export const convertSecondsToHours = (timeInSeconds: number) => {
  const hours = pad(Math.floor(timeInSeconds / 3600));
  const minutes = pad(Math.floor((timeInSeconds % 3600) / 60));
  const remainingSeconds = pad(Math.floor(timeInSeconds % 60));

  return Number(hours) > 0
    ? `${hours}:${minutes}:${remainingSeconds}`
    : `${minutes}:${remainingSeconds}`;
};

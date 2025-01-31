import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VideoBookMark, VideoBookmarkUI } from '../models/video-player.model';
import {
  initialVideoPlayerState,
  convertSecondsToHours,
} from '../utils/video-player.utils';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
})
export class VideoPlayerComponent implements AfterViewInit, OnChanges {
  @Input() enforceBookmarks: boolean[];
  @Input() videoSrc!: string;
  @Input() showVideoControls = true;
  @Input() bookMarks!: VideoBookMark[];
  @Input() activeBookmark!: VideoBookMark | undefined;
  @Output() videoControlsRef = new EventEmitter<TemplateRef<any>>();
  @Output() activeBookmarkChanged = new EventEmitter<VideoBookMark>();
  videoPlayerState = initialVideoPlayerState;
  bookMarkUI!: VideoBookmarkUI[];
  @Output() currentTimeChange = new EventEmitter<number>();

  @ViewChild('videoPlayerEl', { static: true })
  videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer', { static: true })
  videoWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('videoControls', { static: true })
  videoControls!: TemplateRef<any>;
  videoElement: any;

  @HostListener('document:keyup', ['$event'])
  triggerShortcut(event: KeyboardEvent) {
    if (!this.videoPlayerState.error) {
      this.keyboardShortcuts(event);
    }
  }
  constructor(private snackbar: MatSnackBar) {
    this.videoPlayer = new ElementRef(document.createElement('video'));
  }
  ngAfterViewInit(): void {
    const video = this.videoPlayer.nativeElement;
    video.addEventListener('timeupdate', () => {
      const currentTime = video.currentTime;
      console.log('Current Time:', currentTime);

      // Emit the current time
      this.currentTimeChange.emit(currentTime);

      // Find the current bookmark index
      let currentIndex = this.bookMarks.findIndex(
        (bookmark) => currentTime >= bookmark.from && currentTime < bookmark.to
      );

      // If current index is found and enforceBookmarks is false, seek to next valid bookmark
      while (
        currentIndex !== -1 &&
        this.enforceBookmarks[currentIndex] === false
      ) {
        currentIndex++; // Move to the next bookmark

        if (currentIndex >= this.bookMarks.length) {
          return; // Stop if no more bookmarks exist
        }

        console.log('Skipping to:', this.bookMarks[currentIndex].from);
        video.currentTime = this.bookMarks[currentIndex].from;
      }
    });
    if (this.bookMarks && this.bookMarks.length > 0) {
      const firstBookmark = this.activeBookmark;

      if (firstBookmark) {
        this.navigateToBookmark(firstBookmark.from);
      } else {
        video.currentTime = 0;
      }
    } else {
      video.currentTime = 0;
    }
    if (!this.showVideoControls) {
      this.videoControlsRef.emit(this.videoControls);
    }
    // Attach the onTimeUpdate listener
    this.videoPlayer.nativeElement.addEventListener(
      'timeupdate',
      this.onTimeUpdate.bind(this)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeBookmark'] && this.activeBookmark) {
      this.navigateToBookmark(this.activeBookmark.from);
    }
    if (changes && changes['videoSrc']) {
      this.videoPlayerState = initialVideoPlayerState;
    }
  }
  onTimeUpdate(event: Event) {
    const videoElement = event.target as HTMLVideoElement;

    if (this.activeBookmark) {
      const currentTime = videoElement.currentTime;

      if (currentTime < this.activeBookmark.from) {
        videoElement.currentTime = this.activeBookmark.from;
      } else if (currentTime > this.activeBookmark.to) {
        videoElement.currentTime = this.activeBookmark.to;
        videoElement.pause();
      }
    }
  }

  getVideoPlayerCurrentTime() {
    const video = this.videoPlayer?.nativeElement;

    if (video) {
      this.videoPlayerState = {
        ...this.videoPlayerState,
        isBuffering: false,
        error: null,
        isPlaying: video.paused || video.ended ? false : true,
        currentTime: convertSecondsToHours(video.currentTime),
        watchedProgress: isNaN(
          Number(((video.currentTime / video.duration) * 100).toFixed(2))
        )
          ? 0
          : Number(((video.currentTime / video.duration) * 100).toFixed(2)),
      };
    }
  }

  getVideoPlayerDuration() {
    const video = this.videoPlayer?.nativeElement;

    if (video) {
      this.videoPlayerState = {
        ...this.videoPlayerState,
        duration: convertSecondsToHours(video.duration),
      };

      if (this.bookMarks && this.bookMarks.length > 0) {
        this.mapBookMarksToUi();
      }
    }
  }

  setVideoError() {
    const video = this.videoPlayer?.nativeElement;

    if (video.error) {
      this.videoPlayerState = {
        ...this.videoPlayerState,
        error: video.error?.message,
      };

      this.snackbar.open(video.error?.message, 'Error', { duration: 5000 });
    }
  }

  mapBookMarksToUi() {
    const video = this.videoPlayer?.nativeElement;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.bookMarkUI = this.bookMarks.map((bookmark) => {
      if (bookmark.from < video.duration && bookmark.to < video.duration) {
        return {
          width: Number(
            (((bookmark.to - bookmark.from) / video.duration) * 100).toFixed(2)
          ),
          left: Number(((bookmark.from / video.duration) * 100).toFixed(2)),
          ...bookmark,
        };
      }
    }) as VideoBookmarkUI[];
  }

  seekTo(event: MouseEvent) {
    const video = this.videoPlayer?.nativeElement;
    const bookmarkBar = event.currentTarget as HTMLDivElement;
    const boundingClientRect = bookmarkBar.getBoundingClientRect();

    if (!this.videoPlayerState.error) {
      const seekBarProgress = Math.min(
        Math.max(
          0,
          (event.clientX - boundingClientRect.left) / boundingClientRect.width
        ),
        1
      );

      const newTime = seekBarProgress * video.duration;

      if (this.activeBookmark) {
        // If there's an active bookmark with a restriction, limit the seek time
        const { from, to } = this.activeBookmark;
        video.currentTime = Math.min(Math.max(newTime, from), to);
      } else {
        // Default behavior without active bookmark restriction
        video.currentTime = newTime;
      }
    }
  }

  togglePlay() {
    const video = this.videoPlayer.nativeElement;

    if (video.paused || video.ended) {
      video.play();
      this.videoPlayerState = {
        ...this.videoPlayerState,
        isPlaying: true,
      };
    } else {
      video.pause();
      this.videoPlayerState = {
        ...this.videoPlayerState,
        isPlaying: false,
      };
    }
  }

  setBuffer() {
    this.videoPlayerState = {
      ...this.videoPlayerState,
      isBuffering: true,
    };
  }

  setBufferProgress() {
    const video = this.videoPlayer.nativeElement;
    const bufferEnd = video.buffered.end(video.buffered.length - 1);

    this.videoPlayerState = {
      ...this.videoPlayerState,
      bufferProgress: Number(((bufferEnd / video.duration) * 100).toFixed(2)),
    };
  }

  setPlaybackRate(playRateIdx: number) {
    const video = this.videoPlayer.nativeElement;

    this.videoPlayerState = {
      ...this.videoPlayerState,
      currentPlaybackRateIdx: playRateIdx,
    };

    video.playbackRate =
      this.videoPlayerState.playBackRates[
        this.videoPlayerState.currentPlaybackRateIdx
      ];
  }

  toggleMute() {
    const video = this.videoPlayer.nativeElement;

    this.videoPlayerState = {
      ...this.videoPlayerState,
      isMute: !this.videoPlayerState.isMute,
    };
    video.muted = this.videoPlayerState.isMute;
  }

  toggleFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      this.videoPlayerState = {
        ...this.videoPlayerState,
        isFullScreen: false,
      };
    } else {
      this.videoPlayerState = {
        ...this.videoPlayerState,
        isFullScreen: true,
      };
      this.videoWrapper.nativeElement.requestFullscreen();
    }
  }

  exitFullScreen() {
    if (!document.fullscreenElement) {
      this.videoPlayerState = {
        ...this.videoPlayerState,
        isFullScreen: false,
      };
    }
  }

  togglePictureInPicture() {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      this.videoPlayerState = {
        ...this.videoPlayerState,
        isFullScreen: false,
      };
      this.videoPlayer.nativeElement.requestPictureInPicture();
    }
  }

  updateVolume(volume: Event) {
    const video = this.videoPlayer.nativeElement;

    if (video.muted) {
      video.muted = false;
      this.videoPlayerState = {
        ...this.videoPlayerState,
        isMute: false,
      };
    }

    video.volume = Number((volume.target as HTMLInputElement).value);
    this.videoPlayerState = {
      ...this.videoPlayerState,
      volume: Number((volume.target as HTMLInputElement).value),
    };
  }

  skipAhead(skipTo: Event) {
    const video = this.videoPlayer.nativeElement;

    const newTime =
      (Number((skipTo.target as HTMLInputElement).value) / 100) *
      video.duration;
    const { from, to } = this.activeBookmark || {
      from: 0,
      to: video.duration,
    };

    video.currentTime = Math.min(Math.max(newTime, from), to);
  }

  navigateToBookmark(start: number) {
    const video = this.videoPlayer.nativeElement;
    const activeBookmark = this.activeBookmark;

    if (activeBookmark) {
      const newTime = Math.max(start, activeBookmark.from);
      video.currentTime = Math.min(newTime, activeBookmark.to);
      video.currentTime = Math.max(start, activeBookmark.from);
    } else {
      video.currentTime = start !== undefined ? start : 0;
    }
  }

  seekForward() {
    const video = this.videoPlayer.nativeElement;
    if (this.activeBookmark) {
      if (video.currentTime + 5 <= this.activeBookmark.to) {
        video.currentTime += 5;
      } else {
        video.currentTime = this.activeBookmark.to;
      }
    } else {
      if (isFinite(video.duration)) {
        if (video.currentTime + 5 <= video.duration) {
          video.currentTime += 5;
        } else {
          video.currentTime = video.duration;
        }
      }
    }
  }

  seekBackward() {
    const video = this.videoPlayer.nativeElement;
    if (this.activeBookmark) {
      if (video.currentTime - 5 >= this.activeBookmark.from) {
        video.currentTime -= 5;
      } else {
        video.currentTime = this.activeBookmark.from;
      }
    } else {
      if (video.currentTime - 5 >= 0) {
        video.currentTime -= 5;
      } else {
        video.currentTime = 0;
      }
    }
  }

  volumeUp() {
    const video = this.videoPlayer.nativeElement;

    if (video.volume < 1) {
      video.volume += 0.1;
    } else {
      video.volume = 1;
    }

    this.videoPlayerState = {
      ...this.videoPlayerState,
      volume: video.volume,
    };
  }

  volumeDown() {
    const video = this.videoPlayer.nativeElement;

    if (video.volume > 0) {
      video.volume -= 0.1;
    } else {
      video.volume = 0;
    }

    this.videoPlayerState = {
      ...this.videoPlayerState,
      volume: video.volume,
    };
  }

  keyboardShortcuts(event: KeyboardEvent) {
    const { code } = event;

    switch (code) {
      case 'KeyK':
      case 'Space':
        this.togglePlay();
        break;
      case 'KeyM':
        this.toggleMute();
        break;
      case 'KeyF':
        this.toggleFullScreen();
        break;
      case 'KeyP':
        this.togglePictureInPicture();
        break;
      case 'ArrowLeft':
        this.seekBackward();
        break;
      case 'ArrowRight':
        this.seekForward();
        break;
      case 'ArrowUp':
        this.volumeUp();
        break;
      case 'ArrowDown':
        this.volumeDown();
        break;
    }
  }
}

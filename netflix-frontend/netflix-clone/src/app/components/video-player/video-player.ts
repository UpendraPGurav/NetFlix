import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilityService } from '../../shared/services/utility-service';
import { MediaService } from '../../shared/services/media-service';

@Component({
  selector: 'app-video-player',
  standalone: false,
  templateUrl: './video-player.html',
  styleUrl: './video-player.css',
})
export class VideoPlayer {
  @ViewChild('videoPlayer', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  isPlaying = false;
  currentTime = 0;
  duration = 0;
  isMuted = false;
  isFullscreen = false;
  volume = 1;
  showControls = true;
  controlsTimeout: any;
  private boundFullscreenHandler: any;
  private boundKeydownHandler: any;
  authenticatedVideoUrl: string | null = null;

  //1.constructor
  constructor(
    public dialogRef: MatDialogRef<VideoPlayer>,
    @Inject(MAT_DIALOG_DATA) public video: any,
    public utilityService: UtilityService,
    private mediaService: MediaService,
  ) {
    this.boundFullscreenHandler = this.onFullscreenChange.bind(this);
    this.boundKeydownHandler = this.onKeydown.bind(this);

    this.loadAuthenticateVideo();
  }
  //2. Lifecycle hooks
  ngOnInit(): void {
    this.startControlsTimer();

    document.addEventListener('fullscreenchange', this.boundFullscreenHandler);
    document.addEventListener('keydown', this.boundKeydownHandler);

    this.dialogRef.beforeClosed().subscribe(() => {
      this.cleanUp();
    });
  }

  ngOnDestroy(): void {}

  // 3.Initialization & cleanup
  private loadAuthenticateVideo(): void {
    this.authenticatedVideoUrl = this.mediaService.getMediaUrl(this.video.src, 'video');
    console.log('Video Source:', this.authenticatedVideoUrl);
  }

  private cleanUp() {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
      this.controlsTimeout = null;
    }

    document.removeEventListener('fullscreenchange', this.boundFullscreenHandler);
    document.removeEventListener('keydown', this.boundKeydownHandler);

    if (this.videoElement?.nativeElement) {
      const video = this.videoElement.nativeElement;
      video.pause();
      video.currentTime = 0;
      video.src = '';
      video.load();
      this.isPlaying = false;
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  //4.Event handlers
  onKeydown(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return; // Ignore key events when focused on input or textarea
    }
    switch (event.key.toLowerCase()) {
      case ' ':
      case 'k':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'arrowleft':
        event.preventDefault();
        this.seekBackward();
        break;
      case 'arrowright':
        event.preventDefault();
        this.seekForward();
        break;
      case 'arrowup':
        event.preventDefault();
        this.increaseVolume();
        break;
      case 'arrowdown':
        event.preventDefault();
        this.decreaseVolume();
        break;
      case 'm':
        event.preventDefault();
        this.toggleMute();
        break;
      case 'f':
        event.preventDefault();
        this.toggleFullscreen();
        break;
      case 'escape':
        if (document.fullscreenElement) {
          event.preventDefault();
          document.exitFullscreen();
        } else {
          this.closePlayer();
        }
        break;
    }
  }
  onFullscreenChange() {
    this.isFullscreen = !!document.fullscreenElement;
  }

  onLoadedMetaData() {
    console.log('Metadata Loaded');
    if (this.videoElement?.nativeElement) {
      this.duration = this.videoElement.nativeElement.duration;
    }
    console.log('Duration:', this.duration);
  }

  onTimeUpdate() {
    if (this.videoElement?.nativeElement) {
      this.currentTime = this.videoElement.nativeElement.currentTime;
    }
  }

  onMouseMove() {
    this.showControls = true;
    this.startControlsTimer();
  }

  onVideoClick() {
    this.togglePlay();
  }

  onProgressClick(event: MouseEvent) {
    if (!this.videoElement?.nativeElement || !this.duration) return;
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    const newTime = pos * this.duration;

    this.videoElement.nativeElement.currentTime = newTime;
    this.currentTime = newTime;
  }

  //5.Video control methods
  togglePlay() {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;

    if (video.paused) {
      video.play().then(() => {
        this.isPlaying = true;
        this.startControlsTimer();
      });
    } else {
      video.pause();
      this.isPlaying = false;
      this.showControls = true; // show controls immediately
    }
  }

  private pauseAllOtherVideos(currentVideo: HTMLVideoElement) {
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach((video: HTMLVideoElement) => {
      if (video !== currentVideo && !video.paused) {
        video.pause();
      }
    });
  }

  seekBackward() {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    video.currentTime = Math.max(0, video.currentTime - 10);
  }
  seekForward() {
    if (!this.videoElement?.nativeElement) return;
    const video = this.videoElement.nativeElement;
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  }

  //6. volume controls
  toggleMute() {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  changeVolume(event: Event) {
    if (!this.videoElement?.nativeElement) return;

    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    this.setVolume(value);
    this.isMuted = value === 0;
  }

  increaseVolume() {
    if (!this.videoElement?.nativeElement) return;

    const newVolume = Math.min(1, this.volume + 0.1);
    this.setVolume(newVolume);
    this.isMuted = false;
    this.videoElement.nativeElement.muted = false;
  }

  decreaseVolume() {
    if (!this.videoElement?.nativeElement) return;

    const newVolume = Math.max(0, this.volume - 0.1);
    this.setVolume(newVolume);
    this.isMuted = newVolume === 0;
  }

  private setVolume(value: number) {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    video.volume = value;
    this.volume = value;
  }

  //7. Fullscreen controls
  toggleFullscreen() {
    const container = document.querySelector('.player-container');

    if (!document.fullscreenElement) {
      container?.requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;
    }
  }

  //8. UI Controls
  startControlsTimer() {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    this.controlsTimeout = setTimeout(() => {
      this.showControls = false;
    }, 3000);
  }

  closePlayer() {
    this.dialogRef.close();
  }

  //9 Utility methods
  formatTime(seconds: number): string {
    return this.utilityService.formatDuration(seconds);
  }

  //10. getter
  get videoSrc(): string | null {
    return this.authenticatedVideoUrl;
  }

  get progressPercentage(): number {
    return this.duration ? (this.currentTime / this.duration) * 100 : 0;
  }

  get volumePercentage(): number {
    return this.volume * 100;
  }

  onPlay() {
  this.isPlaying = true;
  this.startControlsTimer();
}

onPause() {
  this.isPlaying = false;
  this.showControls = true;
}
}

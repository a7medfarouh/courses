import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { TimePipe } from '../../pipes/time.pipe';
import { LanguageService } from '../../services/language.service';

export interface VideoTime {
  currentTime: number;
  duration: number;
}

const SPEED_STORAGE_KEY = 'thaheen-speed';

@Component({
  selector: 'app-video-player',
  imports: [TimePipe],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css',
})
export class VideoPlayerComponent {
  videoUrl = input.required<string>();
  startTime = input(0); // where to continue from
  timeUpdate = output<VideoTime>();

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('playerBox') playerBox!: ElementRef<HTMLDivElement>;

  speeds = [1, 1.25, 1.5, 2];

  isPlaying = signal(false);
  isLoading = signal(true);
  hasError = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  speed = signal(Number(localStorage.getItem(SPEED_STORAGE_KEY)) || 1);

  constructor(public lang: LanguageService) {
    // when the video changes (next lesson), reset the player
    effect(() => {
      this.videoUrl();
      this.isPlaying.set(false);
      this.isLoading.set(true);
      this.hasError.set(false);
      this.currentTime.set(0);
      this.duration.set(0);
    });
  }

  // ---------- video events ----------

  onLoadedMetadata(): void {
    const video = this.video.nativeElement;
    this.duration.set(video.duration);
    this.isLoading.set(false);
    video.playbackRate = this.speed();

    // resume from the last watched position
    const start = this.startTime();
    if (start > 0 && start < video.duration - 1) {
      video.currentTime = start;
    }
  }

  onTimeUpdate(): void {
    const video = this.video.nativeElement;
    this.currentTime.set(video.currentTime);

    if (isFinite(video.duration)) {
      this.timeUpdate.emit({ currentTime: video.currentTime, duration: video.duration });
    }
  }

  onEnded(): void {
    this.isPlaying.set(false);
    this.timeUpdate.emit({ currentTime: this.duration(), duration: this.duration() });
  }

  onError(): void {
    this.hasError.set(true);
    this.isLoading.set(false);
    this.isPlaying.set(false);
  }

  // ---------- controls ----------

  togglePlay(): void {
    if (this.hasError()) {
      return;
    }

    const video = this.video.nativeElement;
    if (video.paused) {
      // play() can fail if the video changes while starting, the (error) event handles real errors
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  onSeek(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.seekTo(Number(input.value));
  }

  seekTo(seconds: number): void {
    const video = this.video.nativeElement;
    const time = Math.min(Math.max(seconds, 0), this.duration());
    video.currentTime = time;
    this.currentTime.set(time);
  }

  onSpeedChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSpeed = Number(select.value);

    this.speed.set(newSpeed);
    this.video.nativeElement.playbackRate = newSpeed;
    localStorage.setItem(SPEED_STORAGE_KEY, String(newSpeed));
  }

  toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      this.playerBox.nativeElement.requestFullscreen();
    }
  }

  retry(): void {
    this.hasError.set(false);
    this.isLoading.set(true);
    this.video.nativeElement.load();
  }

  // ---------- keyboard shortcuts ----------

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // don't break typing in inputs or the seek bar / speed select
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
      return;
    }

    // a focused button already reacts to Space by itself
    if (target.tagName === 'BUTTON' && event.code === 'Space') {
      return;
    }

    // in Arabic the seek bar goes from right to left, so the arrows are switched
    const forwardKey = this.lang.isRtl() ? 'ArrowLeft' : 'ArrowRight';
    const backwardKey = this.lang.isRtl() ? 'ArrowRight' : 'ArrowLeft';

    if (event.code === 'Space') {
      event.preventDefault();
      this.togglePlay();
    } else if (event.key === forwardKey) {
      event.preventDefault();
      this.seekTo(this.currentTime() + 10);
    } else if (event.key === backwardKey) {
      event.preventDefault();
      this.seekTo(this.currentTime() - 10);
    }
  }
}

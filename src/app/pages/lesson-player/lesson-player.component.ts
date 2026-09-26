import { Component, OnInit, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  VideoPlayerComponent,
  VideoTime,
} from '../../components/video-player/video-player.component';
import { CourseService } from '../../services/course.service';
import { LanguageService } from '../../services/language.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-lesson-player',
  imports: [RouterLink, VideoPlayerComponent],
  templateUrl: './lesson-player.component.html',
  styleUrl: './lesson-player.component.css',
})
export class LessonPlayerComponent implements OnInit {
  // from the url: /courses/:courseId/lessons/:lessonId
  courseId = input.required<string>();
  lessonId = input.required<string>();

  course = computed(() => this.courseService.getCourse(this.courseId()));

  lesson = computed(() => {
    const course = this.course();
    return course ? this.courseService.getLesson(course, this.lessonId()) : undefined;
  });

  nextLesson = computed(() => {
    const course = this.course();
    return course ? this.courseService.getNextLesson(course, this.lessonId()) : undefined;
  });

  constructor(
    public courseService: CourseService,
    public lang: LanguageService,
    private progressService: ProgressService,
  ) {}

  ngOnInit(): void {
    this.courseService.loadCourses();
  }

  getStartTime(): number {
    const progress = this.progressService.getLessonProgress(this.courseId(), this.lessonId());
    return progress ? progress.currentTime : 0;
  }

  isCompleted(): boolean {
    return this.progressService.isCompleted(this.courseId(), this.lessonId());
  }

  isNextLessonUnlocked(): boolean {
    const course = this.course();
    const next = this.nextLesson();
    if (!course || !next) {
      return false;
    }
    return this.progressService.isLessonUnlocked(course, next.id);
  }

  // the player sends the time while playing, we save it
  onTimeUpdate(time: VideoTime): void {
    this.progressService.saveLessonTime(
      this.courseId(),
      this.lessonId(),
      time.currentTime,
      time.duration,
    );
  }
}

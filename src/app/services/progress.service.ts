import { Injectable, signal } from '@angular/core';
import { Course, Lesson } from '../models/course.model';
import { LessonProgress, LessonStatus } from '../models/progress.model';

const STORAGE_KEY = 'thaheen-progress';
const COMPLETE_PERCENT = 0.9;

export interface ContinueWatching {
  course: Course;
  lesson: Lesson;
  progress: LessonProgress;
}

// All the progress logic is here.
// It saves to localStorage now, later we can change saveToStorage/loadFromStorage to call an API.
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private progress = signal<Record<string, LessonProgress>>(this.loadFromStorage());

  getLessonProgress(courseId: string, lessonId: string): LessonProgress | undefined {
    return this.progress()[this.getKey(courseId, lessonId)];
  }

  // Called while the video is playing
  saveLessonTime(courseId: string, lessonId: string, currentTime: number, duration: number): void {
    const key = this.getKey(courseId, lessonId);
    const oldProgress = this.progress()[key];

    // once a lesson is completed it stays completed
    const completed =
      oldProgress?.completed === true || this.isWatchedEnough(currentTime, duration);

    const newProgress: LessonProgress = {
      currentTime: completed ? 0 : currentTime, // a completed lesson starts again from the beginning
      completed: completed,
      lastWatched: Date.now(),
    };

    const allProgress = { ...this.progress(), [key]: newProgress };
    this.progress.set(allProgress);
    this.saveToStorage(allProgress);
  }

  // The 90% rule
  isWatchedEnough(currentTime: number, duration: number): boolean {
    if (!duration || duration <= 0) {
      return false;
    }
    return currentTime / duration >= COMPLETE_PERCENT;
  }

  isCompleted(courseId: string, lessonId: string): boolean {
    return this.getLessonProgress(courseId, lessonId)?.completed === true;
  }

  getLessonStatus(courseId: string, lessonId: string): LessonStatus {
    const progress = this.getLessonProgress(courseId, lessonId);
    if (!progress) {
      return 'not-started';
    }
    if (progress.completed) {
      return 'completed';
    }
    if (progress.currentTime > 0) {
      return 'in-progress';
    }
    return 'not-started';
  }

  // The unlock rule: first lesson is open, any other lesson needs the lesson before it completed
  isLessonUnlocked(course: Course, lessonId: string): boolean {
    const lessons = this.getLessons(course);
    const index = lessons.findIndex((lesson) => lesson.id === lessonId);

    if (index === -1) {
      return false;
    }
    if (index === 0) {
      return true;
    }

    const previousLesson = lessons[index - 1];
    return this.isCompleted(course.id, previousLesson.id);
  }

  // Course progress in % (completed lessons / all lessons)
  getCourseProgress(course: Course): number {
    const lessons = this.getLessons(course);
    if (lessons.length === 0) {
      return 0;
    }

    const completedCount = lessons.filter((lesson) =>
      this.isCompleted(course.id, lesson.id),
    ).length;
    return Math.round((completedCount / lessons.length) * 100);
  }

  // The last lesson the student started and didn't finish
  getContinueWatching(courses: Course[]): ContinueWatching | null {
    let result: ContinueWatching | null = null;

    for (const course of courses) {
      for (const lesson of this.getLessons(course)) {
        const progress = this.getLessonProgress(course.id, lesson.id);
        if (!progress || this.getLessonStatus(course.id, lesson.id) !== 'in-progress') {
          continue;
        }
        if (!result || progress.lastWatched > result.progress.lastWatched) {
          result = { course, lesson, progress };
        }
      }
    }

    return result;
  }

  private getLessons(course: Course): Lesson[] {
    return course.sections.flatMap((section) => section.lessons);
  }

  private getKey(courseId: string, lessonId: string): string {
    return courseId + '/' + lessonId;
  }

  private loadFromStorage(): Record<string, LessonProgress> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      // broken data or storage is blocked
      return {};
    }
  }

  private saveToStorage(progress: Record<string, LessonProgress>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // storage is full or blocked, progress will stay in memory only
    }
  }
}

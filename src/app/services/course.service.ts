import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Course, CoursesFile, Lesson } from '../models/course.model';

@Injectable({ providedIn: 'root' })
export class CourseService {
  courses = signal<Course[]>([]);
  loading = signal(true);
  error = signal(false);

  private loaded = false;

  constructor(private http: HttpClient) {}

  // Loads the courses from the local json file (only once)
  async loadCourses(): Promise<void> {
    if (this.loaded) {
      return;
    }

    this.loading.set(true);
    this.error.set(false);

    try {
      const data = await firstValueFrom(this.http.get<CoursesFile>('assets/data/courses.json'));
      this.courses.set(data.courses);
      this.loaded = true;
    } catch {
      this.error.set(true);
    }

    this.loading.set(false);
  }

  getCourse(courseId: string): Course | undefined {
    return this.courses().find((course) => course.id === courseId);
  }

  // All lessons of the course in order (section 1 lessons, then section 2 lessons...)
  getAllLessons(course: Course): Lesson[] {
    const lessons: Lesson[] = [];
    for (const section of course.sections) {
      lessons.push(...section.lessons);
    }
    return lessons;
  }

  getLesson(course: Course, lessonId: string): Lesson | undefined {
    return this.getAllLessons(course).find((lesson) => lesson.id === lessonId);
  }

  getNextLesson(course: Course, lessonId: string): Lesson | undefined {
    const lessons = this.getAllLessons(course);
    const index = lessons.findIndex((lesson) => lesson.id === lessonId);
    if (index === -1) {
      return undefined;
    }
    return lessons[index + 1];
  }
}

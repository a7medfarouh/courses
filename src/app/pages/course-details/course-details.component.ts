import { Component, OnInit, computed, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Course, Lesson } from '../../models/course.model';
import { TimePipe } from '../../pipes/time.pipe';
import { CourseService } from '../../services/course.service';
import { LanguageService } from '../../services/language.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-course-details',
  imports: [RouterLink, TimePipe],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.css',
})
export class CourseDetailsComponent implements OnInit {
  // from the url: /courses/:courseId?locked=true
  courseId = input.required<string>();
  locked = input<string>();

  course = computed(() => this.courseService.getCourse(this.courseId()));

  constructor(
    public courseService: CourseService,
    public lang: LanguageService,
    private progressService: ProgressService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.courseService.loadCourses();
  }

  getLessonsCount(course: Course): number {
    return this.courseService.getAllLessons(course).length;
  }

  getProgress(course: Course): number {
    return this.progressService.getCourseProgress(course);
  }

  isLocked(course: Course, lesson: Lesson): boolean {
    return !this.progressService.isLessonUnlocked(course, lesson.id);
  }

  getStatus(course: Course, lesson: Lesson): string {
    return this.progressService.getLessonStatus(course.id, lesson.id);
  }

  closeLockedMessage(): void {
    // remove ?locked=true from the url
    this.router.navigate(['/courses', this.courseId()]);
  }
}

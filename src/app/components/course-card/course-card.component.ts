import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';
import { LanguageService } from '../../services/language.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-course-card',
  imports: [RouterLink],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.css',
})
export class CourseCardComponent {
  course = input.required<Course>();

  constructor(
    public lang: LanguageService,
    private courseService: CourseService,
    private progressService: ProgressService,
  ) {}

  getLessonsCount(): number {
    return this.courseService.getAllLessons(this.course()).length;
  }

  getProgress(): number {
    return this.progressService.getCourseProgress(this.course());
  }
}

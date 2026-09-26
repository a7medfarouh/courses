import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { TimePipe } from '../../pipes/time.pipe';
import { CourseService } from '../../services/course.service';
import { LanguageService } from '../../services/language.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-courses',
  imports: [RouterLink, CourseCardComponent, TimePipe],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css',
})
export class CoursesComponent implements OnInit {
  searchText = signal('');

  // search in Arabic and English titles and instructor names
  filteredCourses = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    const courses = this.courseService.courses();

    if (!search) {
      return courses;
    }

    return courses.filter(
      (course) =>
        course.title.ar.toLowerCase().includes(search) ||
        course.title.en.toLowerCase().includes(search) ||
        course.instructor.ar.toLowerCase().includes(search) ||
        course.instructor.en.toLowerCase().includes(search),
    );
  });

  continueWatching = computed(() =>
    this.progressService.getContinueWatching(this.courseService.courses()),
  );

  constructor(
    public courseService: CourseService,
    public lang: LanguageService,
    private progressService: ProgressService,
  ) {}

  ngOnInit(): void {
    this.courseService.loadCourses();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText.set(input.value);
  }

  // how much of the "continue watching" lesson was watched, in %
  getWatchedPercent(): number {
    const item = this.continueWatching();
    if (!item || item.lesson.durationSec === 0) {
      return 0;
    }
    return (item.progress.currentTime / item.lesson.durationSec) * 100;
  }

  getRemainingTime(): number {
    const item = this.continueWatching();
    if (!item) {
      return 0;
    }
    return Math.max(0, item.lesson.durationSec - item.progress.currentTime);
  }
}

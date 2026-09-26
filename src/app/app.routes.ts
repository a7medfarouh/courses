import { Routes } from '@angular/router';
import { lessonGuard } from './guards/lesson.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'courses', pathMatch: 'full' },
  {
    path: 'courses',
    loadComponent: () =>
      import('./pages/courses/courses.component').then((m) => m.CoursesComponent),
  },
  {
    path: 'courses/:courseId',
    loadComponent: () =>
      import('./pages/course-details/course-details.component').then(
        (m) => m.CourseDetailsComponent,
      ),
  },
  {
    path: 'courses/:courseId/lessons/:lessonId',
    canActivate: [lessonGuard],
    loadComponent: () =>
      import('./pages/lesson-player/lesson-player.component').then((m) => m.LessonPlayerComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];

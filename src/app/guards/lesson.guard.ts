import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CourseService } from '../services/course.service';
import { ProgressService } from '../services/progress.service';

// Stops the student from opening a locked lesson by typing the url
export const lessonGuard: CanActivateFn = async (route) => {
  const courseService = inject(CourseService);
  const progressService = inject(ProgressService);
  const router = inject(Router);

  const courseId = route.paramMap.get('courseId') ?? '';
  const lessonId = route.paramMap.get('lessonId') ?? '';

  // the user can open this url directly, so make sure the courses are loaded
  await courseService.loadCourses();

  const course = courseService.getCourse(courseId);

  // if the course or lesson doesn't exist, let the page show "not found"
  if (!course || !courseService.getLesson(course, lessonId)) {
    return true;
  }

  if (progressService.isLessonUnlocked(course, lessonId)) {
    return true;
  }

  // locked: go back to the course page and show a message
  return router.createUrlTree(['/courses', courseId], { queryParams: { locked: true } });
};

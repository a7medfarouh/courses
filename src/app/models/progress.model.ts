export type LessonStatus = 'not-started' | 'in-progress' | 'completed';

export interface LessonProgress {
  currentTime: number; // last position in seconds (used to resume)
  completed: boolean;
  lastWatched: number; // Date.now() of the last update
}

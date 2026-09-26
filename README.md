# Thaheen – Mini Offline LMS

A small student portal for watching course videos. The UI is Arabic first (RTL) with an English switch.
Everything is offline: the courses are in `src/assets/data/courses.json` and the videos are in `src/assets/videos/`.

**Live demo:** https://thaheen-courses.netlify.app

It is deployed on Netlify (build: `npm run build`, publish: `dist/thaheen-lms/browser`).
`public/_redirects` sends every URL to `index.html`, so direct links and refresh work.

## How to run

```bash
npm install
ng serve
```

Then open http://localhost:4200

Built with **Angular 19** (standalone components, signals, zone.js). Node 18.19+ / 20.11+ / 22 is needed.

## Features

- **Courses page** (`/courses`): course cards (image, title, instructor, lessons count, progress %), a "Continue watching" card, and search.
- **Course details** (`/courses/:courseId`): sections and lessons with duration and status (not started / in progress / completed). A lesson is locked until the previous lesson is completed.
- **Lesson player** (`/courses/:courseId/lessons/:lessonId`):
  - my own controls: play/pause, seek bar, time, fullscreen, speed (1x, 1.25x, 1.5x, 2x)
  - continues from the last position
  - the lesson is completed at 90%
  - "Next lesson" button
  - keyboard: Space = play/pause, arrows = seek 10 seconds
  - remembers the last speed
- **Guard**: if you type the URL of a locked lesson, you go back to the course page with a message.
- **Not found**: a wrong lesson id shows "Lesson not found".
- **States**: loading, error, a course without lessons, and a broken video.
- **Progress is saved in localStorage**, so it stays after refresh.
- **Arabic / English** switch.

## Project structure

```
src/app/
├─ models/          interfaces (Course, Section, Lesson, LessonProgress)
├─ services/
│  ├─ course.service.ts     loads courses.json
│  ├─ progress.service.ts   all the progress rules + saving to localStorage
│  ├─ language.service.ts   Arabic/English + page direction
│  └─ translations.ts       UI texts
├─ guards/          lesson.guard.ts (locked lessons)
├─ pipes/           time.pipe.ts (95 → "1:35")
├─ components/      course-card, video-player
└─ pages/           courses, course-details, lesson-player, not-found
```

Every component has its own `.ts`, `.html` and `.css` file.

## My choices

- **Signals for state.** The services keep the data in signals (`courses`, `loading`, `progress`, `language`) and the pages use `computed`. I used signals everywhere to keep one style.
- **All progress logic is in `ProgressService`** (the 90% rule, the unlock rule, the course %). The components only call it, which also makes it easy to test.
- **Saving is behind the service.** Only `loadFromStorage()` and `saveToStorage()` touch localStorage. To use an API later, I only need to change these two methods.
- **Lazy loaded routes** for every page, and a **functional guard**.
- **The guard waits for the courses to load**, so it works when you open a URL directly or refresh.
- **Route params as inputs** (`withComponentInputBinding`), so the page updates when you go to the next lesson.
- I changed `title` and `instructor` in the JSON to `{ "ar": "...", "en": "..." }` for the language switch.
- For the 90% rule I use the real video duration (`video.duration`), not `durationSec` from the JSON, so a wrong number in the JSON doesn't break it.
- **RTL:** the page has `dir="rtl"`. I used flex and `gap` so the layout flips by itself. The seek bar is an `<input type="range">`, so it fills from the right in Arabic. Arrow keys are also flipped in Arabic. The time is inside `dir="ltr"` so it shows as `0:06 / 0:15`.
- No UI library. It's a small app and plain CSS is enough.


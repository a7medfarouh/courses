// Text that has an Arabic and an English version
export interface LocalizedText {
  ar: string;
  en: string;
}

export interface Lesson {
  id: string;
  title: LocalizedText;
  durationSec: number;
  video: string;
}

export interface Section {
  id: string;
  title: LocalizedText;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: LocalizedText;
  instructor: LocalizedText;
  thumbnail: string;
  sections: Section[];
}

export interface CoursesFile {
  courses: Course[];
}

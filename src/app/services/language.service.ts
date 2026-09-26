import { Injectable, signal } from '@angular/core';
import { LocalizedText } from '../models/course.model';
import { translations } from './translations';

export type Language = 'ar' | 'en';

const STORAGE_KEY = 'thaheen-language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  language = signal<Language>(this.getSavedLanguage());

  constructor() {
    this.updatePageDirection();
  }

  toggleLanguage(): void {
    this.language.set(this.language() === 'ar' ? 'en' : 'ar');
    localStorage.setItem(STORAGE_KEY, this.language());
    this.updatePageDirection();
  }

  isRtl(): boolean {
    return this.language() === 'ar';
  }

  // Get a UI text by its key, for example t('myCourses')
  t(key: string): string {
    return translations[this.language()][key] ?? key;
  }

  // Get the right language from a course/lesson title
  text(value: LocalizedText): string {
    return value[this.language()];
  }

  private updatePageDirection(): void {
    document.documentElement.lang = this.language();
    document.documentElement.dir = this.isRtl() ? 'rtl' : 'ltr';
  }

  private getSavedLanguage(): Language {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'ar';
  }
}

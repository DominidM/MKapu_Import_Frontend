import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly storageKey = 'theme';

  initTheme(): void {
    const saved = (localStorage.getItem(this.storageKey) as ThemeMode) ?? 'light';

    if (saved === 'dark') {
      document.documentElement.classList.add('app-dark');
    }
  }

  toggleTheme(): void {
    const html = document.documentElement;
    const isDark = html.classList.toggle('app-dark');

    localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
  }

  isDark(): boolean {
    return document.documentElement.classList.contains('app-dark');
  }
}

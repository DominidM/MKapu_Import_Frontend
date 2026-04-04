import { Injectable } from '@angular/core';
import { signal, effect } from '@angular/core';

export interface AccessibilitySettings {
  fontSize: 'normal' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  readingMode: boolean;
  keyboardNavigation: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AccessibilityService {
  private readonly STORAGE_KEY = 'accessibility-settings';

  private settings = signal<AccessibilitySettings>(this.loadSettings());

  constructor() {
    // Guardar en localStorage cuando cambien las preferencias
    effect(() => {
      const current = this.settings();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
      this.applySettings(current);
    });
  }

  getSettings(): AccessibilitySettings {
    return this.settings();
  }

  updateSettings(newSettings: Partial<AccessibilitySettings>) {
    this.settings.update((current) => ({ ...current, ...newSettings }));
  }

  resetSettings() {
    this.settings.set(this.getDefaultSettings());
  }

  private loadSettings(): AccessibilitySettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  }

  private getDefaultSettings(): AccessibilitySettings {
    return {
      fontSize: 'normal',
      highContrast: false,
      readingMode: false,
      keyboardNavigation: true,
    };
  }

  private applySettings(settings: AccessibilitySettings) {
    const root = document.documentElement;

    // Aplicar tamaño de fuente
    const fontSizeMap = {
      normal: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    };
    root.style.setProperty('--font-size-base', fontSizeMap[settings.fontSize]);

    // Alto contraste
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Modo lectura
    if (settings.readingMode) {
      root.classList.add('reading-mode');
    } else {
      root.classList.remove('reading-mode');
    }
  }
}

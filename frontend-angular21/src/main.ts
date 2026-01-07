import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { App } from './app/app';
import Aura from '@primeuix/themes/aura';
import { routes } from './app/app.routes';
import MyPreset from './app/core/mypreset';
import "primeflex/primeflex.css";


bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    })
  ]
}).catch(err => console.error(err));


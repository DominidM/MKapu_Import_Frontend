// mypreset.ts
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura'; // o el preset que estés usando

// Definir un preset personalizado cambiando solo el primary
const MyPreset = definePreset(Aura, {
  semantic: {
     primary: {
      50: '#fdf6ec',
      100: '#faedcc',
      200: '#f7e4aa',
      300: '#f3da88',
      400: '#f0d067',
      500: '#f6af33', // COLOR BASE
      600: '#e59e2e',
      700: '#d28c29',
      800: '#bf7b24',
      900: '#aa6a1f',
      950: '#885117'
    }
  }
});

export default MyPreset;

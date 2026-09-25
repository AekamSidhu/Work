import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // html2canvas and jsPDF are loaded only when a PDF / image is made, so the
    // app itself stays quick to open on a phone.
    chunkSizeWarningLimit: 800,
  },
});

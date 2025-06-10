import { defineConfig } from 'vite';

export default defineConfig({
    root: '.', // Project root (where index.html is)
    server: {
        port: 5173, // Default port (can be changed)
        open: true // Auto-open browser
    },
    build: {
        outDir: 'dist', // Output directory for production build
        emptyOutDir: true // Clear dist folder on build
    },


});
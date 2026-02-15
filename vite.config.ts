import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    adonisjs({
      entrypoints: ['resources/css/app.css', 'resources/js/app.js'],
      reload: ['resources/views/**/*.edge'],
    }),
    tailwindcss(),
  ],

  server: {
    allowedHosts: [
      'oxyplant-production.up.railway.app',
      'localhost',
      '127.0.0.1',
    ],
  },
})

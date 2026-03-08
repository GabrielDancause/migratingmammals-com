import { defineConfig } from 'astro/config';
export default defineConfig({
  output: 'static',
  site: 'https://migratingmammals.com',
  build: { format: 'file' },
});

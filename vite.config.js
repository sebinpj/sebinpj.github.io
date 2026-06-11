import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  base: '/',
  plugins: [glsl({ minify: true })],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
});

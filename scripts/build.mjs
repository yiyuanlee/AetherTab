import * as esbuild from 'esbuild';
import { mkdirSync } from 'node:fs';

mkdirSync('dist/js', { recursive: true });

await esbuild.build({
  entryPoints: ['js/app.js'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/js/app.js',
  sourcemap: true,
  minify: true,
  target: ['chrome109'],
});

console.log('Built dist/js/app.js');

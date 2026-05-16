import esbuild from 'esbuild';
import { readFileSync } from 'fs';
import { argv } from 'process';

const watch = argv.includes('--watch');
const html = readFileSync('ui.html', 'utf8');

const ctx = await esbuild.context({
  entryPoints: ['src/code.ts'],
  bundle: true,
  outfile: 'code.js',
  target: 'es2017',
  define: { __html__: JSON.stringify(html) },
  logLevel: 'info',
});

if (watch) {
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
}

// build.mjs — esbuild config for the INDEX0 VS Code extension
import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prod = process.argv.includes('--production');

// 1. Extension host bundle (Node.js, CommonJS, externalises vscode)
await esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  external: ['vscode'],
  outfile: 'dist/extension.js',
  sourcemap: !prod,
  minify: prod,
  logLevel: 'info',
});

// 2. Webview bundle (browser, IIFE, inlines CSS)
await esbuild.build({
  entryPoints: ['src/webview/main.ts'],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: 'es2020',
  outfile: 'dist/webview.js',
  sourcemap: !prod,
  minify: prod,
  loader: { '.css': 'text' },
  logLevel: 'info',
  banner: {
    js: `
// Auto-inject styles
(function() {
  const style = document.createElement('style');
  style.textContent = \``,
  },
});

// Inject CSS into webview bundle by appending the style close after the banner
// esbuild doesn't support multi-banner, so we do it in a post-step
const webviewJs = fs.readFileSync('dist/webview.js', 'utf8');
const css = fs.readFileSync('src/webview/styles.css', 'utf8');
const escaped = css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

const patched = `(function(){
const style=document.createElement('style');
style.textContent=\`${escaped}\`;
document.head.appendChild(style);
})();
${webviewJs}`;

fs.writeFileSync('dist/webview.js', patched);

console.log('✓ Extension built →', path.resolve(__dirname, 'dist'));

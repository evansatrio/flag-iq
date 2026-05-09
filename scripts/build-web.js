#!/usr/bin/env node
/**
 * build-web.js — copies the static web app into ./www so Capacitor can sync it.
 *
 * Capacitor's `webDir` must be a folder that contains ONLY the web app
 * (no node_modules, no android/, no scripts/, etc.). We keep authorable
 * files at the project root for easy editing/preview, then this script
 * mirrors only what the APK needs into ./www.
 *
 * Run: npm run build:web
 */
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(ROOT, 'www');

// Files & directories to copy (relative to project root)
const ENTRIES = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'icon.svg',
  'icon-maskable.svg',
  'icons',
];

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function cprf(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      cprf(path.join(src, name), path.join(dst, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

console.log('[build-web] cleaning', OUT);
rmrf(OUT);
fs.mkdirSync(OUT, { recursive: true });

for (const entry of ENTRIES) {
  const src = path.join(ROOT, entry);
  const dst = path.join(OUT, entry);
  if (!fs.existsSync(src)) {
    console.warn('[build-web] skipping (not found):', entry);
    continue;
  }
  cprf(src, dst);
  console.log('[build-web] copied', entry);
}

console.log('[build-web] done →', OUT);

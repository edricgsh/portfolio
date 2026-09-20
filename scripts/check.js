'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const errors = [];
const pages = [];

function walk(dir) {
  fs.readdirSync(dir).forEach(function (name) {
    const item = path.join(dir, name);
    if (fs.statSync(item).isDirectory()) walk(item);
    else if (name.endsWith('.html')) pages.push(item);
  });
}

function routePath(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return path.join(dist, 'index.html');
  if (clean === '/404') return path.join(dist, '404.html');
  return path.join(dist, clean.replace(/^\//, ''), 'index.html');
}

walk(dist);

pages.forEach(function (file) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file);
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  if (h1Count !== 1) errors.push(rel + ': expected one h1, found ' + h1Count);
  if (!/<meta name="description" content="[^"]+">/.test(html)) errors.push(rel + ': missing description');
  if (!/<link rel="canonical" href="https:\/\/edricgan\.dev/.test(html)) errors.push(rel + ': missing canonical');
  if (/<img(?![^>]*\salt=)[^>]*>/i.test(html)) errors.push(rel + ': image without alt');
  if (/\[EDRIC|TODO|FIXME|placeholder|internal note|do not publish|do not disclose|keep (?:the )?.* private|stays private|open question|before publishing|review note|Love Code|Substack|Airwallex|ANEXT|Mindgen|utm_source=medium|originally published|paid users|paid plans|500\+|2,400\+|180,000\+|180K\+|5\.0 · 11|11 public reviews/i.test(html)) errors.push(rel + ': contains private, draft, retired, or unsupported copy');

  const hrefs = html.match(/href="[^"]+"/g) || [];
  hrefs.forEach(function (match) {
    const href = match.slice(6, -1);
    if (/^(https?:|mailto:|#|\/assets\/)/.test(href) || href === '/styles.css' || href === '/app.js') return;
    const target = routePath(href);
    if (!fs.existsSync(target)) errors.push(rel + ': broken internal link ' + href);
  });

  const sources = html.match(/(?:src|href)="\/assets\/[^"]+"/g) || [];
  sources.forEach(function (match) {
    const source = match.replace(/^(?:src|href)="\//, '').replace(/"$/, '');
    if (!fs.existsSync(path.join(dist, source))) errors.push(rel + ': missing asset /' + source);
  });
});

const copyPages = ['index.html', 'projects/index.html', 'work/index.html', 'coaching/index.html'];
const copy = copyPages.map(function (name) {
  const html = fs.readFileSync(path.join(dist, name), 'utf8');
  const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || ['', html])[1];
  return main
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(?:p|h[1-6]|li|dd|dt|blockquote|cite|a|button)>/gi, '. ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
}).join('\n\n');

const qa = path.join(root, '.qa');
fs.mkdirSync(qa, { recursive: true });
fs.writeFileSync(path.join(qa, 'site-copy.txt'), copy, 'utf8');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Checked ' + pages.length + ' HTML pages: headings, metadata, assets, internal links, and private-copy rules passed.');

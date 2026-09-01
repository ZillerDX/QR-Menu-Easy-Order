import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Favicon & Brand Icon Suite', () => {
  const publicDir = path.resolve(__dirname, '../public');
  const indexHtmlPath = path.resolve(__dirname, '../index.html');

  it('index.html should have proper favicon links for all formats', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf-8');
    expect(html).toContain('rel="icon" type="image/svg+xml" href="./favicon.svg"');
    expect(html).toContain('rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png"');
    expect(html).toContain('rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png"');
    expect(html).toContain('rel="icon" type="image/png" href="./favicon.png"');
    expect(html).toContain('rel="shortcut icon" href="./favicon.ico"');
    expect(html).toContain('rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png"');
    expect(html).toContain('name="theme-color" content="#ea580c"');
  });

  it('should have all favicon asset files in public directory', () => {
    const requiredFiles = [
      'favicon.ico',
      'favicon.svg',
      'favicon.png',
      'favicon-32x32.png',
      'favicon-16x16.png',
      'apple-touch-icon.png',
      'logo.jpg',
      'logo.png',
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(publicDir, file);
      expect(fs.existsSync(filePath), `Expected ${file} to exist in public/`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThan(100);
    }
  });

  it('favicon.svg should be valid SVG containing Cafe Order logo', () => {
    const svgPath = path.join(publicDir, 'favicon.svg');
    const content = fs.readFileSync(svgPath, 'utf-8');
    expect(content).toContain('<svg');
    expect(content).toContain('</svg>');
    expect(content).toContain('viewBox="0 0 256 256"');
  });
});

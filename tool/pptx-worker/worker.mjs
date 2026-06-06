import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFile, execFileSync } from 'node:child_process';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import PptxGenJS from 'pptxgenjs';

function text(value) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value);
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    return 'image/jpeg';
  }
  if (ext === '.gif') {
    return 'image/gif';
  }
  if (ext === '.svg') {
    return 'image/svg+xml';
  }
  if (ext === '.webp') {
    return 'image/webp';
  }
  return 'image/png';
}

function resolveAssetPath(assetsDir, value) {
  const raw = text(value).trim();
  if (!raw) {
    throw new Error('asset path is required');
  }
  return path.isAbsolute(raw) ? raw : path.resolve(assetsDir, raw);
}

function imageData(filePath, assetsDir) {
  const resolved = resolveAssetPath(assetsDir, filePath);
  const stat = fs.statSync(resolved);
  if (!stat.isFile()) {
    throw new Error(`asset is not a file: ${resolved}`);
  }
  const data = fs.readFileSync(resolved).toString('base64');
  return `data:${mimeType(resolved)};base64,${data}`;
}

function iconExportName(iconName) {
  const raw = text(iconName).trim();
  if (!raw) {
    throw new Error('icon name is required');
  }
  if (solidIcons[raw]) {
    return raw;
  }

  const stripped = raw
    .replace(/^fa[-_]?/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
  return `fa${stripped.split('-').filter(Boolean).map((part) => (
    `${part[0].toUpperCase()}${part.slice(1)}`
  )).join('')}`;
}

function escapeXml(value) {
  return text(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function iconSvgData(iconName, color = '000000') {
  const exportName = iconExportName(iconName);
  const icon = solidIcons[exportName];
  if (!icon || !icon.icon) {
    throw new Error(`Font Awesome icon not found: ${iconName}`);
  }

  const [width, height, , , svgPathData] = icon.icon;
  const fill = text(color).trim().replace(/^#/, '') || '000000';
  const paths = Array.isArray(svgPathData) ? svgPathData : [svgPathData];
  const pathXml = paths.map((data) => (
    `<path fill="#${escapeXml(fill)}" d="${escapeXml(data)}"/>`
  )).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${pathXml}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function createContext(spec) {
  const assetsDir = path.resolve(spec.assets_dir || path.dirname(spec.script_path));
  return {
    data: spec.data,
    assetsDir,
    outPath: spec.path,
    resolveAsset(value) {
      return resolveAssetPath(assetsDir, value);
    },
    imageData(value) {
      return imageData(value, assetsDir);
    },
    iconSvgData,
  };
}

async function loadBuildFunction(scriptPath) {
  const moduleUrl = pathToFileURL(scriptPath).href;
  const mod = await import(moduleUrl);
  const build = mod.default || mod.build;
  if (typeof build !== 'function') {
    throw new Error('script must export default function build(pptx, ctx) or named function build(pptx, ctx)');
  }
  return build;
}

function createPresentation() {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'OpenAgent';
  pptx.company = 'OpenAgent';
  pptx.subject = 'Generated with OpenAgent';
  return pptx;
}

function execFileAsync(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(file, args, options, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function chromeCandidates() {
  const envCandidates = [
    process.env.OPENAGENT_CHROME_PATH,
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
  ].filter(Boolean);

  const platformCandidates = process.platform === 'win32'
    ? [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      ]
    : process.platform === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
        ]
      : [
          'google-chrome',
          'google-chrome-stable',
          'chromium',
          'chromium-browser',
          'microsoft-edge',
        ];

  return [...envCandidates, ...platformCandidates];
}

function findChromeExecutable() {
  for (const candidate of chromeCandidates()) {
    if (path.isAbsolute(candidate)) {
      if (fs.existsSync(candidate)) return candidate;
      continue;
    }
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch {
      // Try the next browser command.
    }
  }
  return '';
}

function baseHrefForDir(dir) {
  const resolved = path.resolve(dir || process.cwd());
  const withSep = resolved.endsWith(path.sep) ? resolved : `${resolved}${path.sep}`;
  return pathToFileURL(withSep).href;
}

function htmlWithBase(html, assetsDir) {
  const source = text(html).trim();
  if (!source) {
    throw new Error('HTML slide content is required');
  }

  const baseTag = `<base href="${escapeXml(baseHrefForDir(assetsDir))}">`;
  if (/<base\s/i.test(source)) {
    return source;
  }
  if (/<head[^>]*>/i.test(source)) {
    return source.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
  }
  if (/<html[^>]*>/i.test(source)) {
    return source.replace(/<html([^>]*)>/i, `<html$1><head>${baseTag}</head>`);
  }
  return `<!doctype html><html><head>${baseTag}<meta charset="utf-8"></head><body>${source}</body></html>`;
}

function normalizeHtmlSlides(spec) {
  if (Array.isArray(spec.slides) && spec.slides.length > 0) {
    return spec.slides.map((item, index) => {
      if (typeof item === 'string') {
        return { html: item, title: `Slide ${index + 1}`, notes: '' };
      }
      if (!item || typeof item !== 'object') {
        throw new Error(`slides[${index}] must be a string or object`);
      }
      return {
        html: text(item.html),
        title: text(item.title || `Slide ${index + 1}`),
        notes: text(item.notes),
      };
    });
  }
  if (text(spec.html).trim()) {
    return [{ html: spec.html, title: 'Slide 1', notes: '' }];
  }
  return [];
}

function htmlViewport(spec) {
  const width = Number.isFinite(Number(spec.width)) && Number(spec.width) > 0
    ? Math.round(Number(spec.width))
    : 1280;
  const height = Number.isFinite(Number(spec.height)) && Number(spec.height) > 0
    ? Math.round(Number(spec.height))
    : 720;
  return { width, height };
}

function defineHtmlLayout(pptx, viewport) {
  const widthIn = 13.333;
  const heightIn = widthIn * (viewport.height / viewport.width);
  pptx.defineLayout({ name: 'OPENAGENT_HTML', width: widthIn, height: heightIn });
  pptx.layout = 'OPENAGENT_HTML';
  return { w: widthIn, h: heightIn };
}

async function screenshotHtmlSlide({ chromePath, tmpDir, html, assetsDir, viewport, index }) {
  const htmlPath = path.join(tmpDir, `slide-${String(index + 1).padStart(3, '0')}.html`);
  const pngPath = path.join(tmpDir, `slide-${String(index + 1).padStart(3, '0')}.png`);
  const profileDir = path.join(tmpDir, `chrome-profile-${String(index + 1).padStart(3, '0')}`);
  fs.writeFileSync(htmlPath, htmlWithBase(html, assetsDir), 'utf8');

  const argsFor = (headlessFlag) => [
    headlessFlag,
    '--disable-gpu',
    '--disable-gpu-sandbox',
    '--disable-gpu-compositing',
    '--disable-features=VizDisplayCompositor,UseSkiaRenderer',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-background-networking',
    '--no-sandbox',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profileDir}`,
    `--window-size=${viewport.width},${viewport.height}`,
    '--virtual-time-budget=1500',
    `--screenshot=${pngPath}`,
    pathToFileURL(htmlPath).href,
  ];

  try {
    await execFileAsync(chromePath, argsFor('--headless=new'), { timeout: 30000 });
  } catch (firstError) {
    try {
      await execFileAsync(chromePath, argsFor('--headless'), { timeout: 30000 });
    } catch (secondError) {
      const detail = text(secondError.stderr || secondError.message || firstError.message).trim();
      throw new Error(`failed to render HTML slide ${index + 1} with Chrome: ${detail}`);
    }
  }

  if (!fs.existsSync(pngPath)) {
    throw new Error(`Chrome did not create a screenshot for HTML slide ${index + 1}`);
  }
  return `data:image/png;base64,${fs.readFileSync(pngPath).toString('base64')}`;
}

async function generateHtmlDeck(spec) {
  if (!spec.path) {
    throw new Error('path is required');
  }

  spec.path = path.resolve(spec.path);
  fs.mkdirSync(path.dirname(spec.path), { recursive: true });

  const slides = normalizeHtmlSlides(spec);
  if (slides.length === 0) {
    throw new Error('html or slides is required for HTML PowerPoint export');
  }

  const chromePath = findChromeExecutable();
  if (!chromePath) {
    throw new Error('Chrome or Edge was not found; install Chrome/Edge or set OPENAGENT_CHROME_PATH to enable HTML PowerPoint export');
  }

  const viewport = htmlViewport(spec);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openagent-pptx-html-'));
  const pptx = createPresentation();
  const slideSize = defineHtmlLayout(pptx, viewport);

  try {
    for (let i = 0; i < slides.length; i++) {
      const image = await screenshotHtmlSlide({
        chromePath,
        tmpDir,
        html: slides[i].html,
        assetsDir: spec.assets_dir || path.dirname(spec.path),
        viewport,
        index: i,
      });
      const slide = pptx.addSlide();
      slide.background = { color: 'FFFFFF' };
      slide.addImage({ data: image, x: 0, y: 0, w: slideSize.w, h: slideSize.h });
      if (slides[i].notes) {
        slide.addNotes(slides[i].notes);
      }
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  await pptx.writeFile({ fileName: spec.path });
  return {
    ok: true,
    path: spec.path,
    slideCount: slides.length,
    mode: 'html-screenshot',
  };
}

async function generateDeck(spec) {
  if (!spec.path) {
    throw new Error('path is required');
  }
  if (text(spec.html).trim() || (Array.isArray(spec.slides) && spec.slides.length > 0)) {
    return generateHtmlDeck(spec);
  }
  if (!spec.script_path) {
    throw new Error('script_path is required');
  }

  spec.path = path.resolve(spec.path);
  spec.script_path = path.resolve(spec.script_path);

  fs.mkdirSync(path.dirname(spec.path), { recursive: true });

  const pptx = createPresentation();
  let slideCount = 0;
  const originalAddSlide = pptx.addSlide.bind(pptx);
  pptx.addSlide = (...args) => {
    slideCount += 1;
    return originalAddSlide(...args);
  };

  const ctx = createContext(spec);
  const build = await loadBuildFunction(spec.script_path);
  await build(pptx, ctx);

  await pptx.writeFile({ fileName: spec.path });
  return {
    ok: true,
    path: spec.path,
    slideCount,
    mode: 'pptxgenjs',
  };
}

async function main() {
  const specPath = process.argv[2];
  if (!specPath) {
    throw new Error('usage: node worker.mjs <spec.json>');
  }

  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8').replace(/^\uFEFF/, ''));
  return generateDeck(spec);
}

main()
  .then((result) => {
    process.stdout.write(`${JSON.stringify(result)}\n`);
  })
  .catch((error) => {
    process.stdout.write(`${JSON.stringify({
      ok: false,
      path: '',
      slideCount: 0,
      mode: 'pptxgenjs',
      error: error && error.stack ? error.stack : text(error),
    })}\n`);
    process.exitCode = 1;
  });

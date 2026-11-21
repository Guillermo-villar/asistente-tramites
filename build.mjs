import { build, context } from 'esbuild'
import { Resvg } from '@resvg/resvg-js'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'

const watch = process.argv.includes('--watch')
// `--safari` (npm run build:safari): the same extension for Safari, in dist-safari/ (see safariManifest).
const safari = process.argv.includes('--safari')
const outdir = safari ? 'dist-safari' : 'dist'

const shared = {
  bundle: true,
  minify: !watch,
  sourcemap: watch ? 'inline' : false,
  target: safari ? ['safari17'] : 'chrome120',
  logLevel: 'info',
  // __BUILD__ is shown under Settings, so it is clear which build Chrome has loaded.
  define: { 'process.env.NODE_ENV': watch ? '"development"' : '"production"', __BUILD__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC') },
}

const entries = [
  { entryPoints: ['src/ui/main.tsx'], outfile: `${outdir}/sidepanel.js`, format: 'esm' },
  // Safari: a classic service worker script (no "type": "module"), the most widely supported form.
  { entryPoints: ['src/background.ts'], outfile: `${outdir}/background.js`, format: safari ? 'iife' : 'esm' },
  // Injected with chrome.scripting.executeScript, so it must be one classic script.
  { entryPoints: ['src/page/content.ts'], outfile: `${outdir}/content.js`, format: 'iife' },
]

/** The logo (public/logo.svg), drawn in dark indigo on a transparent background. */
async function icon(size) {
  const logo = await readFile('public/logo.svg', 'utf8')
  // No tile behind it, so the mark can fill the square: 116 wide leaves a 6px margin at 128.
  const inner = logo.replace(/<svg/, '<svg x="6" y="7" width="116" height="113.2"').replace(/fill="#[0-9a-fA-F]+"/, 'fill="#2b3a67"')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">${inner}</svg>`
  return new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()
}

/** Safari has no side panel: drop its key and permission (the background opens the UI in a window),
 *  Chrome-only keys, and build the service worker as a classic script. */
function safariManifest(manifest) {
  const out = { ...manifest }
  delete out.side_panel
  delete out.minimum_chrome_version
  out.permissions = (out.permissions ?? []).filter((p) => p !== 'sidePanel')
  out.background = { service_worker: out.background.service_worker }
  return out
}

const FONTS = 'node_modules/@fontsource/ibm-plex-sans/files'

await rm(outdir, { recursive: true, force: true })
await mkdir(`${outdir}/icons`, { recursive: true })
await cp('public', outdir, { recursive: true })
if (safari) {
  const manifest = JSON.parse(await readFile('public/manifest.json', 'utf8'))
  await writeFile(`${outdir}/manifest.json`, JSON.stringify(safariManifest(manifest), null, 2) + '\n')
}
for (const size of [16, 32, 48, 128]) await writeFile(`${outdir}/icons/icon${size}.png`, await icon(size))
await mkdir(`${outdir}/fonts`, { recursive: true })
for (const subset of ['latin', 'latin-ext']) {
  for (const weight of [400, 500, 600, 700]) {
    const file = `ibm-plex-sans-${subset}-${weight}-normal.woff2`
    await cp(`${FONTS}/${file}`, `${outdir}/fonts/${file}`)
  }
}

if (watch) {
  for (const entry of entries) {
    const ctx = await context({ ...shared, ...entry })
    await ctx.watch()
  }
} else {
  await Promise.all(entries.map((entry) => build({ ...shared, ...entry })))
}

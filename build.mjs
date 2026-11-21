import { build, context } from 'esbuild'
import { Resvg } from '@resvg/resvg-js'
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'

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

const pkg = JSON.parse(await readFile('package.json', 'utf8'))

/** Every official domain in plugins/*.json. The extension may read and inject only into these hosts. */
async function pluginDomains() {
  const domains = new Set()
  for (const file of (await readdir('plugins')).filter((name) => name.endsWith('.json')).sort()) {
    const plugin = JSON.parse(await readFile(`plugins/${file}`, 'utf8'))
    for (const domain of plugin.domains ?? []) domains.add(domain)
  }
  return [...domains].sort()
}

/** Public-administration domains the assistant may use without the person's approval (src/trust.ts). */
async function govDomains() {
  const source = await readFile('src/trust.ts', 'utf8')
  const list = /GOV_DOMAINS = \[([\s\S]*?)\]/.exec(source)?.[1] ?? ''
  return [...list.matchAll(/'([a-z0-9.-]+)'/g)].map((m) => m[1])
}

/**
 * The manifest. Host access comes from the site maps and the public-administration domains; any other site
 * is requested at run time, one site at a time, when the person approves it (optional_host_permissions).
 */
async function manifest() {
  const domains = [...new Set([...(await pluginDomains()), ...(await govDomains())])].sort()
  const hosts = domains.flatMap((d) => [`https://${d}/*`, `https://*.${d}/*`])
  return {
    manifest_version: 3,
    name: 'Asistente de trámites',
    short_name: 'Trámites',
    description: 'Te guía por las webs de la Administración: te lleva a la página correcta y te señala lo que tienes que rellenar y pulsar tú.',
    version: pkg.version,
    minimum_chrome_version: '120',
    action: { default_title: 'Asistente de trámites', default_icon: { 16: 'icons/icon16.png', 32: 'icons/icon32.png' } },
    icons: { 16: 'icons/icon16.png', 32: 'icons/icon32.png', 48: 'icons/icon48.png', 128: 'icons/icon128.png' },
    side_panel: { default_path: 'sidepanel.html' },
    background: { service_worker: 'background.js', type: 'module' },
    permissions: ['sidePanel', 'storage', 'scripting', 'tabs'],
    host_permissions: [...hosts, 'https://api.anthropic.com/*'],
    optional_host_permissions: ['https://*/*'],
  }
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
const built = await manifest()
await writeFile(`${outdir}/manifest.json`, JSON.stringify(safari ? safariManifest(built) : built, null, 2) + '\n')
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

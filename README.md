# Digital Space Museum

A student educational museum for the NASA Space Apps Challenge 2026, built from the existing V4 concept for Aliza. Six artifacts, seven language choices, authentic local NASA photographs, a five-scene Ingenuity story, quizzes, galleries, a local recording studio and classroom fullscreen. The public credits contain consent-aware placeholders; no student contributors or recordings are invented. Independent project, without NASA endorsement. Challenge participation or acceptance is not asserted.

## Launch

The visual theme matches the supplied V4 reference: deep blue space backgrounds, warm orange accents, an explicitly labeled illustrated Mars in the hero, rounded panels and bold headings. Authentic NASA photographs remain in the collection and cinematic stories. V5 retains the offline assets, narration workflow and multilingual typography improvements. Updates refresh cached styles; if an older page still appears green, reconnect and reload once to install the update, then refresh again.

On Windows, double-click **Start-Museum.cmd**, keep its terminal open, and visit **http://127.0.0.1:4173**. The launcher uses the local runtime in `tools/` when present, or an installed Node.js runtime. No dependency installation is needed to serve the completed museum.

Use Node.js 20 or later. There is no framework, runtime dependency, API key or build service.

```sh
npm ci
npm start
```

Open **http://127.0.0.1:4173**. Select a language, choose **Start exploring**, then **Play narration**. The default listening mode prefers a student MP3 when available and otherwise uses a matching device voice. Nothing speaks until you press Play. Choose **Visual story · no sound** for a silent demonstration. All student recordings are explicitly pending. See [recording scripts](docs/RECORDING_SCRIPTS.md) to add real MP3s and language-specific cue timings.

The narration studio shows the matching voice’s name and language. Voice discovery starts when the page loads and, when necessary, waits for the browser’s `voiceschanged` event or a bounded retry on Play. A device can only speak languages for which its browser exposes a compatible voice. The Windows machine used for verification exposes Microsoft David, Mark and Zira in English; actual speech-start and sentence-completion events were verified with normal Windows permissions. No Urdu, Pashto or Arabic voice is installed on that machine. For those languages, use a compatible voice available to your browser or add the student MP3; the site never disguises an English voice as another language. Some browser-provided voices require internet.

For this Windows workspace, a downloaded local Node runtime is available (ignored by Git): `tools/node.exe scripts/serve.mjs`. Any ordinary static HTTP server also works. Opening `index.html` directly supports browsing local assets, but service-worker caching and microphone recording require localhost or HTTPS.

## Offline classroom demonstration

The images and fonts are bundled already. On localhost or HTTPS, wait until the status says **Offline museum ready** (English source badges are shown for supplemental text in other languages). Keep this browser profile and origin. Reload once, disconnect the network, and reload again. All collection pages, fonts, story photographs, galleries and quizzes remain available. NASA source links require a connection. Browser TTS depends on installed offline voices and is not required for the demo. No network font imports, analytics, remote image requests or automatic speech are used.

The first download includes a full Simplified Chinese font and may take longer on a slow connection. Service-worker installation is atomic: the museum only reports ready when every precached resource exists. Failed installation never claims success. For a new release, rerun `node scripts/cache.mjs`; the generated content hash selects a new cache. It removes only this application’s old V5 caches, not other sites’ storage. Browsers may evict storage, so check readiness before class. To refresh a previously cached release, reconnect and reload; a new worker takes control after its complete download.

## Ingenuity flight lab

The narration text follows the playback controls immediately. Simple science fact cards and the short video clips come afterward; there are no air-density comparison bars.

Ingenuity also includes a seven-language flight-science panel: an Earth/Mars air-density comparison, gravity and nominal rotor-speed facts, linked primary citations, and the user-selected NASA YouTube video beginning at **1:55**. The 1% comparison is air density, not oxygen content; density and rotor speed vary with conditions. The optional English video requires internet and loads only after a click. Local photographs, narration scripts and the scientific panel work offline; no YouTube video is claimed to be bundled. A browser test intercepts the embed to verify its behaviour without depending on YouTube availability.

Three short online excerpts are available at **0:26–0:56**, **0:59–1:29**, and **1:55–2:25**, each with a translated question and an explanation toggle. Embedded excerpts have explicit start/end boundaries, with no autoplay. Direct YouTube links open the full source at the selected start. The questions also work offline. See [clip selections and review notes](docs/VIDEO_CLIPS.md).

## The science it made possible

Every exhibit has a seven-language panel with a short explanation, two cited figures and NASA source links. The reflector exhibit also has **Laser the Moon**: fire a pulse, read the round-trip time, and calculate the distance with `distance = speed × time ÷ 2`. It is a classroom simulation, not live data, and works offline. Text and figures are in `data/science.js`, the logic is in `science.js`, and claims are cited in [SOURCES.md](docs/SOURCES.md).

## Languages and typography

The single language selector becomes a floating blue-and-orange card when its header position scrolls out of view. Its label remains visible on mobile, and the same selector stays accessible in classroom fullscreen mode. Returning to the top restores it to the header.

English, Urdu, Pashto, Arabic, French, Spanish and Simplified Chinese have separately stored exhibit text. Non-English strings are **unreviewed drafts**, never represented as human-reviewed translations. Supplementary untranslated UI remains explicitly English with an **EN** badge and `lang="en" dir="ltr"`; missing exhibit translations show a visible English-source notice and correct language metadata. Voice matching uses the actual story language. No English text is silently spoken as Urdu or Pashto.

Story text follows V4’s clearer typography at 1.12rem: system UI for Latin scripts, local Noto Nastaliq Urdu for Urdu paragraphs, Noto Naskh Arabic for Arabic/Pashto and Urdu story headings, and Noto Sans SC for Chinese. Generous language-specific line heights preserve RTL readability. The rest of the interface retains its bundled fonts. Layout uses logical properties and document-level `dir`; archive IDs and credits retain their source-language metadata. All bundled font licenses ship in `assets/fonts/`.

## Verify and build

```sh
npm run check
npm test
npm run build
```

`npm test` launches local servers and uses Playwright with installed Chrome or Edge on Windows; otherwise install Chromium with `npx playwright install chromium`. The main suite tests English/Urdu/Pashto/Arabic at phone, tablet and desktop widths, image/font loading, RTL, headline geometry, keyboard and dialog focus, world filters, quiz, narration absence, audio synchronization using a temporary test-only audio response, fullscreen when supported, repository-subpath hosting and service-worker offline reloads. A second suite tests delayed voice discovery, all seven language matches, cancellation, pause/end races, automatic MP3 preference and device-voice fallback; it also records the real browser’s voice capabilities. Mocked control-flow tests do not claim to install missing OS voices. Results/screenshots are written to ignored `test-results/`. See [test report](docs/TEST_REPORT.md).

The flight-lab and excerpt suites additionally check video selection, absolute clip boundaries, single-player cleanup, learning prompts, seven-language keyboard/mobile controls, and offline questions. They use intercepted frames so classroom UI tests do not depend on a live YouTube connection.

`npm run build` regenerates the cache and creates a clean `dist/` directory with deployable assets. Tooling, tests, V4 archive and browser dependencies are excluded. `docs/V4-baseline.html` preserves the original for reference, outside the deployed distribution.

The supplied `Digital-Space-Museum-deploy.zip` contains the deployable files. On Windows, recreate it after building with `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/package.ps1`. To verify the actual build with an offline browser, run `node tests/smoke-dist.mjs`.

## GitHub Pages

1. Put this project in a GitHub repository. Commit bundled `assets/`, `data/`, `audio/`, `docs/`, generated `sw.js`, app files, scripts, tests, `package-lock.json`, and `.github/workflows/pages.yml`. Exclude `tools/`, `node_modules/`, `dist/` and test output.
2. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**.
3. Push to `main` (or adjust the workflow’s branch). The workflow runs static checks and browser tests, builds `dist/`, and deploys it with the Pages action. It requires Pages to be enabled and repository Actions permissions.
4. Open the resulting `https://OWNER.github.io/REPOSITORY/` address. Every app resource is relative, including the scoped service worker. No custom-domain root path is assumed.

For manual hosting, upload **the contents of `dist/`** to any static HTTPS host. The project is deployable locally; this workspace does not assume a GitHub repository remote or publish the student’s work to an unrequested service.

## Content and media maintenance

- `data/ui.js`: interface strings, locale names, directions and draft status.
- `data/content.js`: artifact titles, facts, fictional stories, quiz data and localized cinematic subtitles.
- `data/media.js`: NASA photograph metadata and independent MP3/cue manifest. No audio is currently declared available.
- `audio/en/`, `audio/ur/`, `audio/ps/`, `audio/ar/`, `audio/fr/`, `audio/es/`, `audio/zh-CN/`: recording folders, preserved in Git with empty `.gitkeep` files.
- `docs/ASSET_INVENTORY.json`: all 24 NASA photographs and four font families, with source URLs, byte sizes and SHA-256 checksums; includes the five cinematic scene images.
- `assets/images/`: 24 optimized photographs, longest side at most 1600 px, JPEG quality 86, no cropping or generated content. Display crops in collection cards are cosmetic; the gallery shows the complete downloaded frame.
- `scripts/download-assets.ps1`: reproducible official-source download and optimization on Windows; requires internet and System.Drawing. It skips existing final files.
- `docs/SOURCES.md`: claim and photograph provenance. Source captions are summarized in English; NASA archive captions remain linked.

Maintain consent privately and publish only minimal chosen credits. This site stores only a preferred interface language locally. Microphone recordings stay on the device until a person deliberately downloads and separately submits them. No upload endpoint exists.

Expanded photo stories: Apollo 11, the Apollo 17 rover, the laser reflector, Opportunity and Perseverance debris each have three photographic scenes and four gallery images. See docs/IMAGE_COLLECTIONS.md for all 24 bundled photographs and their NASA credits.

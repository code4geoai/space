# Next session

Updated on 5 November 2026.

The completed V5 work includes the restored V4 blue/orange theme, local NASA images and fonts, seven-language content, narration fallback, offline support, classroom presentation, recording scripts, and the Ingenuity flight-science panel. No student recordings have been supplied; translations remain marked unreviewed.

## Completed enhancement

The requested **short online sections of the NASA video** are implemented: 0:26–0:56, 0:59–1:29 and 1:55–2:25. Each has a localized discussion question and explanation. Video remains online-only; questions work offline. See `docs/VIDEO_CLIPS.md` for source review, behaviour and limits.

No further implementation task is queued. Real student recordings and fluent-speaker review of draft translations remain dependent on contributors; no student voices or consent records have been invented.

Original reference: https://www.youtube.com/watch?v=hW5akI5Rnyg&t=115s

Preserve the V4 blue/orange colours and warm illustrated Mars hero. Keep online video clearly separate from the offline photographic story. Student MP3 recordings should take priority when available; device voices must match the story language.

## Resume locally

Double-click `Start-Museum.cmd`, or run `tools/node.exe scripts/serve.mjs`, and open http://127.0.0.1:4173. Source and deployment instructions are in `README.md`. The generated deployment folder and ZIP are saved locally; runtime downloads, dependencies and generated packages are excluded from Git.

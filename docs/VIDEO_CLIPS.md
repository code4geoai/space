# Short online NASA excerpts

Implemented 5 November 2026. These are bounded playback selections of the original online NASA video; no video has been downloaded or edited into a new file.

| Teaching selection | Source range | Duration | Discussion prompt |
|---|---|---|---|
| Flight engineering | 0:26–0:56 | 30 seconds | Why is producing lift harder in very thin air? |
| Mission milestones | 0:59–1:29 | 30 seconds | How many flights did Ingenuity complete compared with the original plan? |
| A lasting legacy | 1:55–2:25 | 30 seconds | How can equipment keep helping science after flight operations end? |

The original [NASA YouTube video](https://www.youtube.com/watch?v=hW5akI5Rnyg) is linked from NASA’s [mission-ending announcement](https://www.nasa.gov/news-release/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends/). The source page identifies NASA as publisher and reports a 180-second duration. On 5 November, its public automatic chapter markers began at approximately 0:25.48, 0:58.20 and 1:37.60 for the relevant engineering/results/legacy portions. The chosen rounded ranges sit within those portions, and the last retains the user’s requested 1:55 starting point. Sampled player frames were inspected; the public caption endpoint returned an empty response, so no reviewed transcript or exact spoken wording is asserted. Automatic chapter labels are navigation aids, not independently verified science.

Questions and explanations use the independently cited NASA facts in [SOURCES.md](SOURCES.md). They are original teaching prompts, not quotations or a translated video transcript. Every UI language has its own draft wording; the video audio remains the English original. Requested YouTube captions depend on what YouTube makes available, and are not claimed to be reviewed project translations.

## Playback behaviour

- No YouTube request occurs until the visitor selects an excerpt or the full video.
- The embed uses YouTube’s documented `start` and absolute `end` parameters. `end=56` means 0:56 in the source, not 56 seconds after the chosen start. See [YouTube player parameters](https://developers.google.com/youtube/player_parameters#end).
- The visitor presses Play inside the player; the site does not request autoplay. Source seek positions may be adjusted by YouTube to a nearby keyframe.
- Selecting another excerpt replaces the current iframe. Only one player can exist. Close, local narration, language changes and artifact changes remove it.
- The embedded player has a minimum height of 200 px. All excerpt buttons, Close and explanation controls work by keyboard.
- The direct YouTube link opens the **full video at the selected start**. Its stop boundary is not guaranteed outside the embedded player; this is stated in the interface.
- The full-video option remains available, opening from 1:55 without an excerpt end parameter.
- Without internet, the site creates no video player and displays a clear message. All three questions and explanations, the facts, photographs and story remain usable.

## Verification

`node tests/video-clips.mjs` checks all start/end values, one-player behaviour, no autoplay, questions, keyboard operation, minimum player height, all six languages at 320 px, narration cleanup and offline access. Automated UI tests intercept the iframe with a test response; they do not claim to test YouTube’s remote media delivery. Live-player verification is recorded separately in the test report, including any environmental limits.

# Ingenuity recording pack

All three scripts are fictional first-person narration based on cited NASA mission facts. The machine is a storytelling character, not a speaking historical witness. Urdu and Pashto are **unreviewed drafts**: a fluent speaker should check meaning, pronunciation and suitability before recording or public release. Do not claim NASA approval.

No student has supplied a recording yet. Do not create synthetic voices and label them student recordings. Obtain the student’s and guardian’s permission before publishing a minor’s voice. Keep permission records privately, outside this repository; public credit can be a chosen nickname or omitted entirely.

## English → audio/en/ingenuity.mp3

1. **A small beginning.** I am Ingenuity. I arrived on Mars with Perseverance, a small machine carrying a big question: could I fly here?
2. **The first leap.** On April 19, 2021, I rose above Mars. My camera caught my shadow: a little shape with a new possibility.
3. **A new perspective.** From the air, I could see the ground differently. Imagine the excitement of looking at a familiar world in a completely new way. The surface air on Mars is about 1% as dense as Earth’s air at sea level, so making enough lift is difficult.
4. **Traces of a journey.** Later, I photographed the parachute and backshell that helped Perseverance land. Even discarded equipment can tell an engineering story.
5. **A legacy beyond flight.** I completed seventy-two flights. My final flight damaged my rotors. I cannot fly now, but imagine the next explorer inspired by what we learned.

## اردو → audio/ur/ingenuity.mp3

**ابتدائی مسودہ — ماہرِ زبان کا جائزہ ضروری ہے۔**

1. **ایک چھوٹی شروعات۔** میں انجینیوٹی ہوں۔ پرسیویرنس کے ساتھ مریخ پر آیا۔ ایک ننھی مشین اور ایک بڑا سوال: کیا میں یہاں اڑ سکتا ہوں؟
2. **پہلی پرواز۔** ۱۹ اپریل ۲۰۲۱ کو میں مریخ کی سطح سے اوپر اٹھا۔ میرے کیمرے نے میرا سایہ دیکھا، ایک نئی امید کی ننھی سی شکل۔
3. **ایک نیا منظر۔** فضا سے زمین مختلف دکھائی دی۔ سوچیں، کسی جانی پہچانی دنیا کو بالکل نئے انداز سے دیکھنا کتنا دلچسپ ہوگا۔ مریخ کی سطح پر ہوا کی کثافت زمین کی سطحِ سمندر کی ہوا کا تقریباً ایک فیصد ہے، اس لیے اڑنے کے لیے کافی قوت پیدا کرنا مشکل ہے۔
4. **سفر کی نشانیاں۔** پھر میں نے اس پیراشوٹ اور خول کی تصویریں لیں جنہوں نے پرسیویرنس کو اتارا تھا۔ چھوڑا ہوا سامان بھی انجینئرنگ کی کہانی سناتا ہے۔
5. **پرواز سے آگے۔** میں نے بہتر پروازیں کیں۔ آخری پرواز میں میرے پنکھوں کو نقصان پہنچا۔ اب اڑ نہیں سکتا، مگر ہماری سیکھ اگلے کھوج کرنے والوں کی مدد کرے گی۔

The word **بہتر** in the final segment means seventy-two here; verify its reading with the narrator. The subtitle and script must agree with 72 flights.

## پښتو → audio/ps/ingenuity.mp3

**د ژباړې مسوده — د ژبې د ماهر کتنې ته اړتیا لري.**

1. **یو کوچنی پیل.** زه انجینیوټي یم. له پرسیویرنس سره مریخ ته راغلم. یوه کوچنۍ وسیله او یوه لویه پوښتنه: ایا زه دلته الوتلی شم؟
2. **لومړۍ الوتنه.** د ۲۰۲۱ کال د اپرېل په ۱۹ د مریخ له سطحې پورته شوم. کمرې مې زما سیوری ولید، یوه کوچنۍ بڼه او نوی امکان.
3. **نوی لید.** له هوا څخه ځمکه بېله ښکارېده. فکر وکړئ، یوه اشنا نړۍ په بشپړ نوي ډول لیدل به څومره په زړه پورې وي. د مریخ د سطحې د هوا کثافت د ځمکې د سمندر د سطحې د هوا شاوخوا یوه سلنه دی، نو د پورته کېدو ځواک جوړول ګران دي.
4. **د سفر نښې.** وروسته مې د هغه پراشوټ او پوښ انځورونه واخیستل چې د پرسیویرنس په ناستې کې یې مرسته کړې وه. پاتې توکي هم د انجینرۍ کیسه کوي.
5. **له الوتنې هاخوا.** ما دوه اویا الوتنې وکړې. وروستۍ الوتنې مې څرخېدونکي وزرونه زیانمن کړل. اوس نه شم الوتلی، خو زموږ زده کړې به راتلونکو سپړونکو ته الهام ورکړي.

## Record, review, install

1. Review `data/content.js` with a fluent speaker and a teacher. Record the five story segments only, in order; do not read headings unless you also include their duration in cues. Leave natural pauses. Use a quiet room and a comfortable pace. Timing is measured after recording, rather than forcing a child to match a timer.
2. The local recorder requires HTTPS or localhost and microphone permission. It downloads WebM (or Ogg if the browser provides it). It does not upload. Convert to actual MP3 in a trusted audio editor; renaming a WebM file is insufficient. An external recorder is equally suitable.
3. Export mono MP3 at 96–128 kbps. Trim long silence and avoid clipping. Listen to the complete result with the narrator and guardian. Save at the exact path above; six artifact IDs are `apollo11`, `rover`, `reflector`, `opportunity`, `ingenuity`, `debris`. Other supported language folders are `ar`, `fr`, `es`, `zh-CN`.
4. In `data/media.js`, add a recording entry (the following is a **schema example, not a claim that an MP3 exists**):

```js
"ur/ingenuity": {
  available: true,
  file: "audio/ur/ingenuity.mp3",
  duration: 68.4,
  cues: [0, 13.2, 25.6, 38.7, 52.1]
}
```

5. Replace the example numbers with the actual start of each spoken segment and exact duration. Five increasing cue starts, beginning at zero, are required for Ingenuity. Each other artifact now has three photographic scenes and needs three increasing cue starts, beginning at zero. Measure the start of each of its three story sentences. The player uses MP3 `currentTime`, not a second independent timer, so pause, seek and playback speed keep scenes/subtitles together.
6. Run `npm run check`, `node scripts/cache.mjs`, `npm test`, and `npm run build`. A recording marked available but missing from disk fails checks. Rebuild and redeploy to include it in the offline cache.
7. For a source change, keep this script pack and `data/content.js` identical. Changing language/artifact stops playback; the application never substitutes an unrelated language voice. The default listening mode prefers the reviewed student MP3 and otherwise uses a matching device voice after the visitor presses Play. Device narration follows sentence and scene completion; the silent mode remains available. A device voice is never labeled as a student recording.

The silent demonstration uses five 12-second scenes (60 seconds); these are presentation timings, not final recording cues. A recording can have different timings for every language.

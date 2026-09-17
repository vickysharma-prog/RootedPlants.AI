# The video

`rooted-demo.mp4` is built from here. 1920x1080, 4:31, subtitles burned in,
forest underneath.

```bash
cd video
python -m http.server 3333 &     # cards.html has to be served, not opened
python record.py all             # films the live site at phone size
python build.py                  # speaks, renders, composites, encodes
```

Needs `ffmpeg` and Chrome on PATH, plus
`pip install edge-tts websocket-client qrcode[pil]`. No keys.

## What is in it and what is missing

`cards.html` is the eighteen frames the film is cut from, in the app's own
tokens: same serif, same mono, same dark and gold, so nothing on screen
announces that it came from a different tool. Every element carries a step, so
things arrive on the sentence that introduces them rather than all at once at
the top, and one frame is rendered per step.

`record.py` films the live site at 390 by 844, straight off Chrome's
compositor, so the forest behind the landing page is actually moving. Six of
those recordings play inside the phone in the finished film.

`build.py` speaks the narration, times the subtitles to it, renders every
frame, lays each recording into its phone for exactly the stretch its card is
on screen, and encodes the lot with a forest bed underneath. It prints how far
the audio and the picture disagree, which should be zero.

`reminder.html` is the one piece of footage that is drawn rather than filmed: a
lock screen, the notification dropping in, then the same message in a thread
and in an inbox. **The words in it are not invented.** They are exactly what
`web/lib/notify.ts` composes for a neem that is a day late, in the weather the
app actually read. It carries nobody else's logo and copies nobody's interface;
the channel is named in words, because the channel is the fact. When the
reminder keys are set, replace it with a real delivery.

**Three frames still have a phone-shaped hole**, each labelled on screen with
what belongs there:

| Frame | Record | Why it cannot be generated |
|---|---|---|
| 10 | The camera guiding you, sound on | Needs a real camera pointed at a real plant |
| 12 | It refusing a different plant | Needs two plants of the same species |
| 13 | A notebook, then a real plant | Needs both in front of a camera |


Drop each recording into its hole in an editor and the film is finished.

## Changing it

The script is `BEATS` in `build.py`: one line per breath, which card is on
screen while it is said, and how long to hold in silence afterwards. Two lines
on the same card simply hold that card longer. Change a line, run it again, and
the subtitles retime themselves.

`docs/video.md` has the reasoning: why fifteen beats, why nothing runs longer
than thirty seconds, and which three moments the whole film rests on.

# The video

`rooted-demo.mp4` is built from here. 1920x1080, 3:58, subtitles burned in.

```bash
cd video
python -m http.server 3333 &
python build.py
```

Needs `ffmpeg` on PATH and `pip install edge-tts`. Nothing else, and no keys.

## What is in it and what is missing

`cards.html` is the twelve frames the film is cut from, in the app's own
tokens: same serif, same mono, same dark and gold, so nothing on screen
announces that it came from a different tool. `build.py` speaks the narration,
times the subtitles to it, renders each card headless at 1920x1080 and cuts the
whole thing together with a forest bed underneath.

**Seven of those frames have a phone-shaped hole in them**, each labelled with
what belongs there:

| Frame | Record |
|---|---|
| 2 | Hands planting a sapling |
| 4 | Today, with the weather line |
| 5 | The camera guiding you, sound on |
| 6 | The checks landing one by one |
| 7 | It refusing a different plant |
| 8 | A notebook, then a real plant |
| 9 | A locked phone, then the message arriving |

Those are real footage of a real plant and they have to be shot, not
generated. Drop each recording into its hole in an editor and the film is
finished.

## Changing it

The script is `BEATS` in `build.py`: one line per breath, which card is on
screen while it is said, and how long to hold in silence afterwards. Two lines
on the same card simply hold that card longer. Change a line, run it again, and
the subtitles retime themselves.

`docs/video.md` has the reasoning: why fifteen beats, why nothing runs longer
than thirty seconds, and which three moments the whole film rests on.

"""Record the app as it looks on a phone.

Drives a headless Chrome at an exact phone viewport and pulls frames straight
off the compositor, so the forest video behind the landing page is actually
moving in the recording rather than frozen the way a screenshot leaves it.

    python record.py landing
    python record.py all

Writes footage/<name>.mp4 at 390x844, thirty frames a second. Those go inside
the phone frame in the finished film.

Needs Chrome, ffmpeg, and `pip install websocket-client`.
"""

import base64
import json
import pathlib
import shutil
import socket
import subprocess
import sys
import time

import websocket

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / "footage"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 9222
SITE = "https://rootedplants.vercel.app"

# A phone, at the size most phones report.
W, H = 390, 844
FPS = 30


class Tab:
    """The little of the DevTools protocol this needs."""

    def __init__(self, ws_url: str):
        self.ws = websocket.create_connection(ws_url, timeout=30, suppress_origin=True)
        self.n = 0
        self.frames = []

    def send(self, method: str, **params):
        self.n += 1
        self.ws.send(json.dumps({"id": self.n, "method": method, "params": params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("id") == self.n:
                return msg.get("result", {})
            self._event(msg)

    def pump(self, seconds: float):
        """Sit and collect screencast frames for a while."""
        end = time.time() + seconds
        self.ws.settimeout(1.0)
        while time.time() < end:
            try:
                self._event(json.loads(self.ws.recv()))
            except Exception:
                pass
        self.ws.settimeout(30)

    def _event(self, msg):
        if msg.get("method") == "Page.screencastFrame":
            p = msg["params"]
            # Chrome emits a frame when something changes, not on a clock, so
            # each one carries the moment it arrived. Writing them at a fixed
            # rate turned twenty seconds of scrolling into six.
            self.frames.append((time.time(), base64.b64decode(p["data"])))
            try:
                self.ws.send(json.dumps({
                    "id": 10_000 + len(self.frames),
                    "method": "Page.screencastFrameAck",
                    "params": {"sessionId": p["sessionId"]},
                }))
            except Exception:
                pass

    def eval(self, expr: str, wait=True):
        return self.send(
            "Runtime.evaluate",
            expression=expr,
            awaitPromise=wait,
            returnByValue=True,
            userGesture=True,
        )

    def close(self):
        try:
            self.ws.close()
        except Exception:
            pass


def start_chrome(profile: pathlib.Path):
    return subprocess.Popen(
        [
            CHROME,
            "--headless=new",
            f"--remote-debugging-port={PORT}",
            f"--user-data-dir={profile}",
            f"--window-size={W},{H}",
            "--hide-scrollbars",
            "--autoplay-policy=no-user-gesture-required",
            "--disable-gpu",
            "--no-first-run",
            # Chrome refuses a websocket whose Origin it was not told about,
            # and this one is our own loopback.
            "--remote-allow-origins=*",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def wait_for_port(timeout=30):
    end = time.time() + timeout
    while time.time() < end:
        try:
            with socket.create_connection(("localhost", PORT), timeout=1):
                return True
        except OSError:
            time.sleep(0.4)
    return False


def open_tab() -> Tab:
    """Attach to the blank tab Chrome was started with.

    /json/new wants a PUT on current Chrome and answers 404 to anything else,
    and there is already a page target sitting there, so use that.
    """
    import urllib.request

    raw = urllib.request.urlopen(f"http://localhost:{PORT}/json/list").read()
    for t in json.loads(raw):
        if t.get("type") == "page" and t.get("webSocketDebuggerUrl"):
            return Tab(t["webSocketDebuggerUrl"])
    raise SystemExit("chrome opened no page target")


def write_clip(frames, name: str):
    """Each frame held for as long as it was actually on screen."""
    if len(frames) < 2:
        print(f"  {name}: nothing to write")
        return

    tmp = OUT / f"_{name}"
    if tmp.exists():
        shutil.rmtree(tmp)
    tmp.mkdir(parents=True)

    for i, (_, data) in enumerate(frames):
        (tmp / f"{i:05d}.jpg").write_bytes(data)

    t0 = frames[0][0]
    span = frames[-1][0] - t0
    lines = []
    for i, (t, _) in enumerate(frames):
        nxt = frames[i + 1][0] if i + 1 < len(frames) else t + 1 / FPS
        lines.append(f"file '{(tmp / f'{i:05d}.jpg').as_posix()}'")
        lines.append(f"duration {max(1 / 60, nxt - t):.4f}")
    lines.append(f"file '{(tmp / f'{len(frames) - 1:05d}.jpg').as_posix()}'")
    listing = tmp / "frames.txt"
    listing.write_text(chr(10).join(lines), encoding="utf-8")

    out = OUT / f"{name}.mp4"
    subprocess.run(
        [
            "ffmpeg", "-loglevel", "error", "-y",
            "-f", "concat", "-safe", "0", "-i", str(listing),
            "-vf", f"fps={FPS},scale={W}:{H}:flags=lanczos,format=yuv420p",
            "-c:v", "libx264", "-preset", "slow", "-crf", "18",
            str(out),
        ],
        check=True,
    )
    shutil.rmtree(tmp)
    print(f"  {name:12} {len(frames):4} frames  {span:5.1f}s  {out.stat().st_size / 1e6:.1f} MB")


# Each clip: where to go, how long to sit there, and what to do while sitting.
SMOOTH_SCROLL = """
(async () => {
  const end = document.body.scrollHeight - innerHeight;
  const run = %d;
  const start = performance.now();
  await new Promise(done => {
    function step(t) {
      const k = Math.min(1, (t - start) / run);
      const ease = k < 0.5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2) / 2;
      scrollTo(0, end * ease);
      if (k < 1) requestAnimationFrame(step); else done();
    }
    requestAnimationFrame(step);
  });
})()
"""

CLIPS = {
    # The whole landing page, top to bottom, with the forest moving behind it.
    "landing": (f"{SITE}/", 20, SMOOTH_SCROLL % 15000),
    # Signing up, and the clip that plays on that page.
    "join": (f"{SITE}/join", 13, SMOOTH_SCROLL % 9000),
    # What is due, and why now.
    "today": (f"{SITE}/today", 9, None),
    # Everything in your care.
    "plants": (f"{SITE}/plants", 12, SMOOTH_SCROLL % 8000),
    # Balance, catalogue, history.
    "rewards": (f"{SITE}/rewards", 12, SMOOTH_SCROLL % 8000),
    # How a task is checked.
    "howitworks": (f"{SITE}/how-it-works", 14, SMOOTH_SCROLL % 10000),
    # The reminder arriving. Rendered here rather than filmed off a phone,
    # from the words notify.ts actually composes.
    "reminder": ("http://localhost:3333/reminder.html?wait", 17, "window.play()"),
}


# These only exist before there is an account, so they are filmed first.
SIGNED_OUT = {"landing", "join", "howitworks", "reminder"}


def record(tab: Tab, name: str, url: str, seconds: float, script):
    tab.frames = []
    tab.send("Page.navigate", url=url)
    time.sleep(5.5)

    # The demo account seeds on first load and the videos need a nudge.
    tab.eval("document.querySelectorAll('video').forEach(v=>{v.muted=true;v.play().catch(()=>{})}); scrollTo(0,0); 1", wait=False)
    time.sleep(2.5)

    tab.send(
        "Page.startScreencast",
        format="jpeg", quality=92, maxWidth=W * 2, maxHeight=H * 2, everyNthFrame=1,
    )

    if script:
        tab.eval(script, wait=False)
    tab.pump(seconds)

    tab.send("Page.stopScreencast")
    write_clip(tab.frames, name)


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    names = list(CLIPS) if which == "all" else [which]
    for n in names:
        if n not in CLIPS:
            sys.exit(f"no clip called {n}. try: {', '.join(CLIPS)}")

    OUT.mkdir(exist_ok=True)
    profile = HERE / "build" / "chrome-profile"
    profile.mkdir(parents=True, exist_ok=True)

    proc = start_chrome(profile)
    try:
        if not wait_for_port():
            sys.exit("chrome did not open a debugging port")
        tab = open_tab()
        tab.send("Page.enable")
        tab.send("Runtime.enable")
        tab.send(
            "Emulation.setDeviceMetricsOverride",
            width=W, height=H, deviceScaleFactor=2, mobile=True,
        )

        print(f"recording {len(names)} clip(s) at {W}x{H}")

        signed_out = [n for n in names if n in SIGNED_OUT]
        for n in signed_out:
            url, secs, script = CLIPS[n]
            record(tab, n, url, secs, script)

        # Then sign in once, so every screen after this is a real account
        # rather than a signed-out shell.
        tab.send("Page.navigate", url=f"{SITE}/join")
        time.sleep(5)
        tab.eval(
            "(async()=>{const f=[...document.querySelectorAll('form')]"
            ".find(x=>x.innerText.toLowerCase().includes('demo'));"
            "if(f) f.requestSubmit(); return !!f})()"
        )
        time.sleep(6)

        for n in names:
            if n in SIGNED_OUT:
                continue
            url, secs, script = CLIPS[n]
            record(tab, n, url, secs, script)

        tab.close()
    finally:
        proc.terminate()

    print(f"\nfootage in {OUT}")


if __name__ == "__main__":
    main()

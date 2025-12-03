import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getLayoutById, layouts } from '../data/layouts.js';
import Photobooth from '../vendor/photobooth.js';

export default function Booth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const layoutId = params.get('layout') || layouts[0].id;
  const layout = useMemo(() => getLayoutById(layoutId), [layoutId]);

  const hostRef = useRef(null);
  const pbRef = useRef(null);
  const canvasRef = useRef(null);
  const pendingShotRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState('');
  const [currentPose, setCurrentPose] = useState(0);
  const currentPoseRef = useRef(0);
  const [shots, setShots] = useState(Array(layout.poses).fill(null));
  const [countdown, setCountdown] = useState(0);
  const [composedUrl, setComposedUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(0);
  const [bri, setBri] = useState(0);
  const [mirror, setMirror] = useState(false);
  const [cropEnabled, setCropEnabled] = useState(false);

  useEffect(() => {
    // if layout changes, reset shots count
    setShots(Array(layout.poses).fill(null));
    setCurrentPose(0);
    currentPoseRef.current = 0;
    setComposedUrl('');
  }, [layoutId]);

  useEffect(() => {
    // Initialize Photobooth widget
    if (!hostRef.current) return;
    try {
      const pb = new Photobooth(hostRef.current);
      pbRef.current = pb;
      pb.onImage = (dataUrl) => {
        const idx = currentPoseRef.current;
        setShots(prev => {
          const next = [...prev];
          next[idx] = dataUrl;
          return next;
        });
        if (idx + 1 < layout.poses) setCurrentPose(p => {
          const np = p + 1;
          currentPoseRef.current = np;
          return np;
        });
      };
      // Resize to container size
      const applySize = () => {
        const el = hostRef.current;
        if (!el) return;
        const w = el.clientWidth || 640;
        // Prefer 4:3 internal aspect for camera
        const h = el.clientHeight || Math.round((el.clientWidth || 640) * 3/4);
        try { pb.resize(Math.max(200,w), Math.max(200,h)); } catch {}
      };
      applySize();
      const ro = new ResizeObserver(applySize);
      ro.observe(hostRef.current);
      // initialize controls from pb
      try {
        setHue(Math.round((pb.getHueOffset?.() || 0) * 100));
        setSat(Math.round((pb.getSaturationOffset?.() || 0) * 100));
        setBri(Math.round((pb.getBrightnessOffset?.() || 0) * 100));
        setCropEnabled(!!pb.getCropActive?.());
      } catch {}
      setReady(true);
      return () => {
        try { ro.disconnect(); } catch {}
        try { pb.destroy(); } catch {}
      };
    } catch (e) {
      setError(e?.message || 'Photobooth init failed');
    }
  }, []);

  // basic responsive canvas size matching video
  const doCapture = () => {
    if (pbRef.current && pbRef.current.capture) {
      pbRef.current.capture();
    }
  };

  const retake = (idx) => {
    setCurrentPose(idx);
    currentPoseRef.current = idx;
  };

  const startCountdownAndCapture = (seconds = 3) => {
    if (!ready) return;
    // Ensure camera is started via a user gesture before capturing
    try {
      if (!started) {
        pbRef.current?.start?.();
        setStarted(true);
      }
    } catch {}
    setComposedUrl('');
    pendingShotRef.current = true;
    setCountdown(seconds);
    const tick = () => {
      setCountdown(c => {
        const next = c - 1;
        if (next <= 0) {
          return 0;
        }
        setTimeout(tick, 1000);
        return next;
      });
    };
    setTimeout(tick, 1000);
  };

  // When countdown hits 0 (from a started countdown), trigger capture on next frames
  useEffect(() => {
    if (pendingShotRef.current && countdown === 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          doCapture();
          pendingShotRef.current = false;
        });
      });
    }
  }, [countdown]);

  // Keep ref in sync with state changes from buttons
  useEffect(() => {
    currentPoseRef.current = currentPose;
  }, [currentPose]);

  const allDone = useMemo(() => shots.every(Boolean), [shots]);

  const composeCollage = async () => {
    // very simple composition rules per category
    const images = await Promise.all(shots.map(loadImage));
    const { canvas, ctx } = createCanvasForLayout(layout, images);
    drawLayout(layout, images, canvas, ctx);
    setComposedUrl(canvas.toDataURL('image/jpeg', 0.95));
  };

  // Persist shots to session and navigate to editor
  const goToEditor = () => {
    try {
      sessionStorage.setItem('pixbooth_shots', JSON.stringify(shots));
      sessionStorage.setItem('pixbooth_layout', layoutId);
    } catch {}
    navigate(`/editor?layout=${layoutId}`);
  };

  return (
    <main className="booth-page">
      <div className="booth-header">
        <button className="link" onClick={() => navigate(-1)}>&larr; Back</button>
        <div className="booth-title">{layout.name}</div>
        <div className="booth-poses">{currentPose + 1}/{layout.poses}</div>
      </div>

      {error && <div className="booth-error">{error}</div>}

      <div className="booth-body">
        <div className={`booth-preview ${mirror ? 'mirror' : ''}`}>
          <button className="booth-settings-btn" title="Settings" onClick={() => setShowSettings(s => !s)}>⚙️</button>
          {showSettings && (
            <div className="booth-settings-panel" onMouseDown={e => e.stopPropagation()}>
              <div className="booth-settings-row">
                <label>
                  <span>Hue</span>
                  <span>{hue}</span>
                </label>
                <input type="range" min={-50} max={50} step={1} value={hue}
                  onChange={e => {
                    const v = parseInt(e.target.value, 10); setHue(v);
                    try { pbRef.current?.setHueOffset?.(v/100); } catch {}
                  }} />
              </div>
              <div className="booth-settings-row">
                <label>
                  <span>Saturation</span>
                  <span>{sat}</span>
                </label>
                <input type="range" min={-50} max={50} step={1} value={sat}
                  onChange={e => {
                    const v = parseInt(e.target.value, 10); setSat(v);
                    try { pbRef.current?.setSaturationOffset?.(v/100); } catch {}
                  }} />
              </div>
              <div className="booth-settings-row">
                <label>
                  <span>Brightness</span>
                  <span>{bri}</span>
                </label>
                <input type="range" min={-50} max={50} step={1} value={bri}
                  onChange={e => {
                    const v = parseInt(e.target.value, 10); setBri(v);
                    try { pbRef.current?.setBrightnessOffset?.(v/100); } catch {}
                  }} />
              </div>
              <div className="booth-settings-toggles">
                <label>
                  <input type="checkbox" checked={mirror} onChange={e => setMirror(e.target.checked)} /> Mirror preview
                </label>
                <label>
                  <input type="checkbox" checked={cropEnabled}
                    onChange={e => {
                      const on = e.target.checked; setCropEnabled(on);
                      try { pbRef.current?.setCropActive?.(on); } catch {}
                    }} /> Crop
                </label>
              </div>
            </div>
          )}
          {/* Enforce 4:3 display area for the camera */}
          <div
            ref={hostRef}
            className="photobooth-host"
            style={{ width: '100%', aspectRatio: '4 / 3', maxHeight: '100%' }}
          />
          <canvas ref={canvasRef} className="booth-canvas" style={{ display: 'none' }} />
          {countdown > 0 && <div className="booth-countdown">{countdown}</div>}
        </div>

        <div className="booth-side">
          <div className="booth-controls">
          {!allDone && (
            <button className="primary" disabled={!ready || !!countdown} onClick={() => startCountdownAndCapture(3)}>
              {shots[currentPose] ? 'Retake' : 'Capture'}
            </button>
          )}
          {!started && (
            <div className="booth-tip">Klik "Capture" untuk memulai kamera.</div>
          )}
          {!allDone && currentPose > 0 && (
            <button onClick={() => setCurrentPose(p => Math.max(0, p - 1))}>Previous</button>
          )}
          {!allDone && currentPose + 1 < layout.poses && (
            <button disabled={!shots[currentPose]} onClick={() => setCurrentPose(p => p + 1)}>Next</button>
          )}
          {allDone && (
            <>
              <button className="primary" onClick={composeCollage}>Make Collage</button>
              <button onClick={() => downloadAll(shots)}>Download All</button>
              <button onClick={goToEditor}>Edit Strip</button>
              <button onClick={() => { setShots(Array(layout.poses).fill(null)); setCurrentPose(0); setComposedUrl(''); }}>Reset</button>
            </>
          )}
          </div>

          <div className="booth-shots">
            {shots.map((s, i) => (
              <div key={i} className={`shot ${i === currentPose ? 'is-active' : ''}`}>
                {s ? <img src={s} alt={`Pose ${i+1}`} /> : <div className="shot-placeholder">Pose {i+1}</div>}
                {s && <button className="link" onClick={() => retake(i)}>Retake</button>}
              </div>
            ))}
          </div>
        </div>

        {composedUrl && (
          <div className="booth-collage">
            <img src={composedUrl} alt="Collage" />
            <div className="booth-collage-actions">
              <button className="primary" onClick={() => downloadDataUrl(composedUrl, `${layout.id}-collage.jpg`)}>Download Collage</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// helpers
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function createCanvasForLayout(layout, images) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const baseW = 1200; // output width target
  const aspect = images[0] ? images[0].width / images[0].height : 4/3;

  if (layout.category === 'Single') {
    canvas.width = baseW;
    canvas.height = Math.round(baseW / aspect);
  } else if (layout.category === 'Strip') {
    canvas.width = Math.round(baseW * 0.5);
    canvas.height = canvas.width * layout.poses; // vertical strip
  } else {
    // Collage: 2 or 3 columns depending on poses
    const cols = layout.poses <= 4 ? 2 : 3;
    const rows = Math.ceil(layout.poses / cols);
    const cellW = Math.floor(baseW / cols);
    const cellH = Math.floor(cellW / aspect);
    canvas.width = cols * cellW;
    canvas.height = rows * cellH;
  }
  return { canvas, ctx };
}

function drawLayout(layout, images, canvas, ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (layout.category === 'Single') {
    drawContain(images[0], ctx, 0, 0, canvas.width, canvas.height);
  } else if (layout.category === 'Strip') {
    const cellW = canvas.width;
    const cellH = Math.floor(canvas.height / layout.poses);
    images.forEach((img, i) => {
      drawContain(img, ctx, 0, i * cellH, cellW, cellH);
    });
  } else {
    const cols = layout.poses <= 4 ? 2 : 3;
    const cellW = Math.floor(canvas.width / cols);
    const cellH = Math.floor(canvas.height / Math.ceil(layout.poses / cols));
    images.forEach((img, idx) => {
      const x = (idx % cols) * cellW;
      const y = Math.floor(idx / cols) * cellH;
      drawContain(img, ctx, x, y, cellW, cellH);
    });
  }
}

function drawContain(img, ctx, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let dw = w, dh = h;
  if (imgRatio > boxRatio) {
    dh = Math.round(w / imgRatio);
    y += Math.round((h - dh) / 2);
  } else {
    dw = Math.round(h * imgRatio);
    x += Math.round((w - dw) / 2);
  }
  ctx.drawImage(img, x, y, dw, dh);
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function downloadAll(urls) {
  urls.forEach((url, i) => downloadDataUrl(url, `pose-${i + 1}.jpg`));
}

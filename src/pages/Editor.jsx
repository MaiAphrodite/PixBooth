import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getLayoutById, layouts } from '../data/layouts.js';
import '../instagram.css';
// Load Fabric via CDN at runtime to avoid local resolver issues
const FABRIC_CDN = 'https://cdn.jsdelivr.net/npm/fabric@5.3.0/dist/fabric.min.js';
let fabric = (typeof window !== 'undefined' && window.fabric) ? window.fabric : null;
const P5_CDN = 'https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.min.js';
let p5lib = (typeof window !== 'undefined' && window.p5) ? window.p5 : null;

export default function Editor() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const layoutId = params.get('layout') || layouts[0].id;
  const layout = useMemo(() => getLayoutById(layoutId), [layoutId]);
  const [shots, setShots] = useState([]);

  // Frame color and filter/sticker selections
  const [frameHex, setFrameHex] = useState('#ffffff');
  const [filter, setFilter] = useState('none');
  const [stickerPack, setStickerPack] = useState('none');
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const stripRef = useRef(null);
  const patternCanvasRef = useRef(null);
  const [pattern, setPattern] = useState('none');
  const [patternColorA, setPatternColorA] = useState('#cc857f');
  const [patternColorB, setPatternColorB] = useState('#ffffff');
  // Derive complementary color for logo based on background
  const hexToHsl = (hex) => {
    let r = 0, g = 0, b = 0;
    const m = hex.replace('#','');
    if (m.length === 3) {
      r = parseInt(m[0]+m[0],16); g = parseInt(m[1]+m[1],16); b = parseInt(m[2]+m[2],16);
    } else {
      r = parseInt(m.slice(0,2),16); g = parseInt(m.slice(2,4),16); b = parseInt(m.slice(4,6),16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h = 0, s = 0, l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h, s, l };
  };
  const hslToHex = ({h,s,l}) => {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = (x) => {
      const v = Math.round(x * 255).toString(16).padStart(2,'0');
      return v;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };
  const relativeLuminance = (hex) => {
    const m = hex.replace('#','');
    const r = parseInt(m.slice(0,2),16) / 255;
    const g = parseInt(m.slice(2,4),16) / 255;
    const b = parseInt(m.slice(4,6),16) / 255;
    const lin = (v) => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
    const R = lin(r), G = lin(g), B = lin(b);
    return 0.2126*R + 0.7152*G + 0.0722*B;
  };
  const contrastRatio = (hex1, hex2) => {
    const L1 = relativeLuminance(hex1);
    const L2 = relativeLuminance(hex2);
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  };
  const computeSplitComplementary = (hex) => {
    try {
      const hsl = hexToHsl(hex);
      const delta = 30/360; // split complement ~30°
      const c1 = { h: (hsl.h + 0.5 + delta) % 1, s: hsl.s, l: hsl.l };
      const c2 = { h: (hsl.h + 0.5 - delta + 1) % 1, s: hsl.s, l: hsl.l };
      const hex1 = hslToHex(c1);
      const hex2 = hslToHex(c2);
      // Choose the one with higher contrast against base
      return contrastRatio(hex, hex1) >= contrastRatio(hex, hex2) ? hex1 : hex2;
    } catch { return '#595880'; }
  };
  const BRAND_HEX = '#CC857F';
  const isWhite = (hex) => {
    const { l, s } = hexToHsl(hex);
    return l > 0.95 && s < 0.05; // near white
  };
  const isBlack = (hex) => {
    const { l, s } = hexToHsl(hex);
    return l < 0.05 && s < 0.2; // near black
  };
  const logoColor = useMemo(() => {
    // If a pattern is used, always use brand color; split complementary only applies to solid frame color.
    if (pattern !== 'none') {
      return BRAND_HEX;
    }
    // Solid background: if white or black, use actual brand color; otherwise complementary
    if (isWhite(frameHex) || isBlack(frameHex)) return BRAND_HEX;
    return computeSplitComplementary(frameHex);
  }, [pattern, patternColorA, patternColorB, frameHex]);

  // Instagram.css filter set
  const filters = [
    'none',
    'clarendon', 'gingham', 'moon', 'lofi', 'valencia', 'nashville', '1977', 'toaster', 'earlybird', 'xpro-ii',
    'hudson', 'hefe', 'juno', 'crema', 'ludwig'
  ];
  const stickers = ['none','party','love','summer','royal','spooky','kawaii','retro','gamer'];

  // Load shots from sessionStorage
  useMemo(() => {
    try {
      const raw = sessionStorage.getItem('pixbooth_shots');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setShots(arr);
      }
    } catch {}
  }, [layoutId]);

  // Initialize Fabric.js canvas for stickers
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const start = () => {
      if (!fabric && typeof window !== 'undefined') fabric = window.fabric;
      if (!fabric) return;
      const canvas = new fabric.Canvas(el, {
        width: 460,
        height: 340,
        backgroundColor: 'transparent',
        selection: true,
      });
      fabricRef.current = canvas;
      canvas.setBackgroundColor('transparent', canvas.renderAll.bind(canvas));
    };
    if (!fabric) {
      const s = document.createElement('script');
      s.src = FABRIC_CDN;
      s.async = true;
      s.onload = start;
      document.head.appendChild(s);
      return () => { try { document.head.removeChild(s); } catch {} };
    } else {
      start();
    }
    return () => {
      const c = fabricRef.current;
      if (c) { try { c.dispose(); } catch {} }
      fabricRef.current = null;
    };
  }, []);
  // Ensure p5.js loaded
  const ensureP5 = () => new Promise((resolve, reject) => {
    if (p5lib) return resolve(p5lib);
    const s = document.createElement('script');
    s.src = P5_CDN;
    s.async = true;
    s.onload = () => { p5lib = window.p5; resolve(p5lib); };
    s.onerror = reject;
    document.head.appendChild(s);
  });

  // Render pattern using p5 onto an offscreen canvas and apply as background
  const renderPattern = async () => {
    if (!stripRef.current) return;
    const w = stripRef.current.offsetWidth;
    const h = stripRef.current.offsetHeight;
    if (pattern === 'none') {
      stripRef.current.style.backgroundImage = 'none';
      stripRef.current.style.backgroundColor = frameHex;
      return;
    }
    try {
      await ensureP5();
      // Create an offscreen canvas
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      patternCanvasRef.current = off;
      const sketch = (p) => {
        p.setup = () => {
          p.createCanvas(w, h);
          const gfx = p.createGraphics(w, h);
          if (pattern === 'waves') {
            gfx.background(patternColorB);
            gfx.noFill();
            gfx.stroke(patternColorA);
            gfx.strokeWeight(8);
            for (let y = 0; y < h; y += 24) {
              gfx.beginShape();
              for (let x = 0; x <= w; x += 8) {
                const yy = y + Math.sin(x * 0.04) * 12;
                gfx.vertex(x, yy);
              }
              gfx.endShape();
            }
          } else if (pattern === 'checker') {
            const size = 32;
            for (let y = 0; y < h; y += size) {
              for (let x = 0; x < w; x += size) {
                const alt = ((x / size) + (y / size)) % 2 === 0;
                gfx.fill(alt ? patternColorA : patternColorB);
                gfx.noStroke();
                gfx.rect(x, y, size, size);
              }
            }
          } else if (pattern === 'diagonal') {
            // Diagonal stripes
            const stripe = 22;
            gfx.noStroke();
            for (let k = -h; k < w + h; k += stripe) {
              gfx.fill(patternColorA);
              gfx.quad(k, 0, k + stripe, 0, k, h, k - stripe, h);
              gfx.fill(patternColorB);
              gfx.quad(k + stripe, 0, k + stripe * 2, 0, k + stripe, h, k, h);
            }
          } else if (pattern === 'polka') {
            // Polka dots
            const r = 12;
            const gap = 36;
            gfx.background(patternColorB);
            gfx.noStroke();
            gfx.fill(patternColorA);
            for (let y = r; y < h; y += gap) {
              for (let x = r; x < w; x += gap) {
                const offset = (y / gap) % 2 === 0 ? 0 : r;
                gfx.circle(x + offset, y, r * 2);
              }
            }
          } else if (pattern === 'zigzag') {
            // Zigzag chevrons
            gfx.background(patternColorB);
            gfx.noFill();
            gfx.stroke(patternColorA);
            gfx.strokeWeight(10);
            const step = 24;
            for (let y = 0; y < h; y += step * 2) {
              gfx.beginShape();
              for (let x = 0; x <= w; x += step) {
                const yy = y + (x % (step * 2) === 0 ? 0 : step);
                gfx.vertex(x, yy);
              }
              gfx.endShape();
            }
          } else if (pattern === 'grid') {
            // Simple grid
            gfx.background(patternColorB);
            gfx.stroke(patternColorA);
            gfx.strokeWeight(2);
            const size = 28;
            for (let x = 0; x <= w; x += size) gfx.line(x, 0, x, h);
            for (let y = 0; y <= h; y += size) gfx.line(0, y, w, y);
          }
          p.image(gfx, 0, 0);
          const url = p.canvas.toDataURL('image/png');
          stripRef.current.style.backgroundImage = `url(${url})`;
          stripRef.current.style.backgroundSize = 'cover';
          stripRef.current.style.backgroundPosition = 'center';
          p.remove();
        };
      };
      // Start sketch and immediately render once
      new p5lib(sketch);
    } catch (e) {
      console.error('Pattern render failed', e);
    }
  };

  useEffect(() => {
    renderPattern();
    // Re-render when size or inputs change
  }, [pattern, patternColorA, patternColorB, frameHex]);

  // Export the entire editor strip as an image (PNG)
  const exportStrip = async () => {
    const node = stripRef.current;
    if (!node) return;
    // Lazy-load html2canvas from CDN to avoid bundler issues
    const ensureHtml2Canvas = () => new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.html2canvas) return resolve(window.html2canvas);
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      s.async = true;
      s.onload = () => resolve(window.html2canvas);
      s.onerror = reject;
      document.head.appendChild(s);
    });
    try {
      const html2canvas = await ensureHtml2Canvas();
      // Use background color of strip to ensure proper base
      const bg = window.getComputedStyle(node).backgroundColor || '#ffffff';
      // Render at higher scale for HD output
      const scaleFactor = Math.max(3, window.devicePixelRatio || 1);
      const canvas = await html2canvas(node, {
        backgroundColor: bg,
        useCORS: true,
        allowTaint: false,
        scale: scaleFactor,
        width: node.offsetWidth,
        height: node.offsetHeight,
      });
      // Ensure smoothing for upscaled render
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.imageSmoothingQuality = 'high';
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `pixbooth-strip-${layoutId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export strip:', err);
      alert('Gagal mengekspor strip. Coba lagi.');
    }
  };

  const headerItems = [
    { label: 'Home' },
    { label: 'How It Works?' },
    { label: 'Gallery' },
    { label: 'Event' },
    { label: 'Vendor' },
  ];

  return (
    <main className="editor-page">
      <div className="editor-title">Kreasikan Strip Foto Sesuai Gayamu!</div>
      <div className="editor-subtitle">Layout yang dipilih: <span className="regular">{layout.name}</span></div>

      <section className="editor-body">
        <div className="editor-left">
          <div ref={stripRef} className="editor-strip" style={{ backgroundColor: frameHex }}>
            {(shots.length ? shots : Array(layout.poses).fill(null)).map((s, i) => (
              <div key={i} className="editor-strip-cell">
                {s ? (
                  <div className={`editor-img ${filterClass(filter)}`}>
                    <img src={s} alt={`Pose ${i+1}`} />
                  </div>
                ) : (
                  <div className={`editor-img ${filterClass(filter)}`} />
                )}
              </div>
            ))}
            <div className="editor-strip-footer" aria-label="PixBooth branding">
              {/* Inline PixBooth SVG per provided spec with dynamic color */}
              <div className={pattern !== 'none' ? 'editor-strip-logo-wrap' : ''} style={pattern !== 'none' ? { backgroundColor: '#ffffff', borderRadius: 10, padding: 8 } : undefined}>
              <svg
                className="editor-strip-logo"
                style={{ color: logoColor }}
                width="57"
                height="30"
                viewBox="0 0 57 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M9.552 5.384C9.552 6.03467 9.40267 6.632 9.104 7.176C8.80533 7.70933 8.34667 8.14133 7.728 8.472C7.10933 8.80267 6.34133 8.968 5.424 8.968H3.728V13H0.992V1.768H5.424C6.32 1.768 7.07733 1.92267 7.696 2.232C8.31467 2.54133 8.77867 2.968 9.088 3.512C9.39733 4.056 9.552 4.68 9.552 5.384ZM5.216 6.792C5.73867 6.792 6.128 6.66933 6.384 6.424C6.64 6.17867 6.768 5.832 6.768 5.384C6.768 4.936 6.64 4.58933 6.384 4.344C6.128 4.09867 5.73867 3.976 5.216 3.976H3.728V6.792H5.216ZM13.7124 1.768V13H10.9764V1.768H13.7124ZM22.5751 13L20.2871 9.56L18.2711 13H15.1671L18.7671 7.288L15.0871 1.768H18.2711L20.5271 5.16L22.5111 1.768H25.6151L22.0471 7.432L25.7591 13H22.5751ZM7.792 22.24C8.44267 22.3787 8.96533 22.704 9.36 23.216C9.75467 23.7173 9.952 24.2933 9.952 24.944C9.952 25.8827 9.62133 26.6293 8.96 27.184C8.30933 27.728 7.39733 28 6.224 28H0.992V16.768H6.048C7.18933 16.768 8.08 17.0293 8.72 17.552C9.37067 18.0747 9.696 18.784 9.696 19.68C9.696 20.3413 9.52 20.8907 9.168 21.328C8.82667 21.7653 8.368 22.0693 7.792 22.24ZM3.728 21.312H5.52C5.968 21.312 6.30933 21.216 6.544 21.024C6.78933 20.8213 6.912 20.528 6.912 20.144C6.912 19.76 6.78933 19.4667 6.544 19.264C6.30933 19.0613 5.968 18.96 5.52 18.96H3.728V21.312ZM5.744 25.792C6.20267 25.792 6.55467 25.6907 6.8 25.488C7.056 25.2747 7.184 24.9707 7.184 24.576C7.184 24.1813 7.05067 23.872 6.784 23.648C6.528 23.424 6.17067 23.312 5.712 23.312H3.728V25.792H5.744ZM16.8509 28.112C15.7949 28.112 14.8242 27.8667 13.9389 27.376C13.0642 26.8853 12.3655 26.2027 11.8429 25.328C11.3309 24.4427 11.0749 23.4507 11.0749 22.352C11.0749 21.2533 11.3309 20.2667 11.8429 19.392C12.3655 18.5173 13.0642 17.8347 13.9389 17.344C14.8242 16.8533 15.7949 16.608 16.8509 16.608C17.9069 16.608 18.8722 16.8533 19.7469 17.344C20.6322 17.8347 21.3255 18.5173 21.8269 19.392C22.3389 20.2667 22.5949 21.2533 22.5949 22.352C22.5949 23.4507 22.3389 24.4427 21.8269 25.328C21.3149 26.2027 20.6215 26.8853 19.7469 27.376C18.8722 27.8667 17.9069 28.112 16.8509 28.112ZM16.8509 25.616C17.7469 25.616 18.4615 25.3173 18.9949 24.72C19.5389 24.1227 19.8109 23.3333 19.8109 22.352C19.8109 21.36 19.5389 20.5707 18.9949 19.984C18.4615 19.3867 17.7469 19.088 16.8509 19.088C15.9442 19.088 15.2189 19.3813 14.6749 19.968C14.1415 20.5547 13.8749 21.3493 13.8749 22.352C13.8749 23.344 14.1415 24.1387 14.6749 24.736C15.2189 25.3227 15.9442 25.616 16.8509 25.616ZM29.429 28.112C28.373 28.112 27.4023 27.8667 26.517 27.376C25.6423 26.8853 24.9437 26.2027 24.421 25.328C23.909 24.4427 23.653 23.4507 23.653 22.352C23.653 21.2533 23.909 20.2667 24.421 19.392C24.9437 18.5173 25.6423 17.8347 26.517 17.344C27.4023 16.8533 28.373 16.608 29.429 16.608C30.485 16.608 31.4503 16.8533 32.325 17.344C33.2103 17.8347 33.9037 18.5173 34.405 19.392C34.917 20.2667 35.173 21.2533 35.173 22.352C35.173 23.4507 34.917 24.4427 34.405 25.328C33.893 26.2027 33.1997 26.8853 32.325 27.376C31.4503 27.8667 30.485 28.112 29.429 28.112ZM29.429 25.616C30.325 25.616 31.0397 25.3173 31.573 24.72C32.117 24.1227 32.389 23.3333 32.389 22.352C32.389 21.36 32.117 20.5707 31.573 19.984C31.0397 19.3867 30.325 19.088 29.429 19.088C28.5223 19.088 27.797 19.3813 27.253 19.968C26.7197 20.5547 26.453 21.3493 26.453 22.352C26.453 23.344 26.7197 24.1387 27.253 24.736C27.797 25.3227 28.5223 25.616 29.429 25.616ZM44.7751 16.768V18.96H41.7991V28H39.0631V18.96H36.0871V16.768H44.7751ZM55.8763 16.768V28H53.1403V23.376H48.8843V28H46.1483V16.768H48.8843V21.168H53.1403V16.768H55.8763Z" fill="currentColor"></path>
                <line x1="29" y1="8" x2="56" y2="8" stroke="currentColor" strokeWidth="4"></line>
              </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="editor-right">
                    <div className="editor-section">
                      <div className="editor-section-title">Pattern Background</div>
                      <div className="editor-chip-row">
                        {['none','waves','checker','diagonal','polka','zigzag','grid'].map((p) => (
                          <button
                            key={p}
                            className={`chip ${pattern === p ? 'active' : ''}`}
                            onClick={() => setPattern(p)}
                          >
                            {p === 'none' ? 'None' : p.charAt(0).toUpperCase()+p.slice(1)}
                          </button>
                        ))}
                      </div>
                      <div className="editor-color-picker" style={{marginTop:12}}>
                        <div>
                          <label>A Color</label>
                          <input type="color" value={patternColorA} onChange={(e)=>setPatternColorA(e.target.value)} />
                        </div>
                        <div>
                          <label>B Color</label>
                          <input type="color" value={patternColorB} onChange={(e)=>setPatternColorB(e.target.value)} />
                        </div>
                      </div>
                    </div>
          <div className="editor-section">
            <div className="editor-section-title">Warna Bingkai</div>
            <div className="editor-color-picker">
              <input
                type="color"
                value={frameHex}
                onChange={(e) => setFrameHex(e.target.value)}
                aria-label="Frame Color"
              />
              <div className="editor-hex">HEX: {frameHex.toUpperCase()}</div>
            </div>
          </div>

          <div className="editor-section">
            <div className="editor-section-title">Stiker</div>
            <div className="editor-chip-row">
              {stickers.map((s) => (
                <button
                  key={s}
                  className={`chip ${stickerPack === s ? 'active' : ''}`}
                  onClick={() => {
                    setStickerPack(s);
                    addStickersForPack(s);
                  }}
                >
                  {labelForSticker(s)}
                </button>
              ))}
            </div>
            <div className="editor-sticker-canvas">
              <canvas ref={canvasRef} />
              <div className="editor-sticker-actions">
                <button className="chip" onClick={clearStickers}>Clear Stickers</button>
              </div>
            </div>
          </div>

          <div className="editor-section">
            <div className="editor-section-title">Filter</div>
            <div className="editor-chip-row">
              {filters.map((f) => (
                <button
                  key={f}
                  className={`chip ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {labelForFilter(f)}
                </button>
              ))}
            </div>
          </div>

          <div className="editor-actions">
            <button className="action" onClick={exportStrip}>
              <span className="icon" />
              <span>Download Foto Strip</span>
            </button>
            <button className="action">
              <span className="icon" />
              <span>Download via QR code</span>
            </button>
            <button className="action" onClick={() => navigate(`/booth?layout=${layoutId}`)}>
              <span className="icon" />
              <span>Ambil foto lagi</span>
            </button>
            <button className="action">
              <span className="icon" />
              <span>Simpan ke galeri</span>
            </button>
          </div>
        </div>
      </section>

      <footer className="editor-footer">
        <div className="footer-card">
          <div className="footer-col">
            <div className="footer-title">Contact Us</div>
            <div className="footer-text">
              📧 Email: support@pixbooth.io<br />
              📞 Phone: +62 812-3456-7890<br />
              📍 Location: Jakarta, Indonesia
            </div>
          </div>
          <div className="footer-col">
            <div className="footer-title">Follow Us</div>
            <div className="footer-text">
              🔗 Instagram: @pixbooth.io<br />
              🔗 TikTok: @pixbooth.io<br />
              🔗 Twitter/X: @pixbooth_io
            </div>
          </div>
        </div>
        <div className="footer-note">
          <strong>© 2025 PixBooth. All rights reserved.</strong><br />
          Bringing smiles, filters, and memories to your browser.
        </div>
      </footer>
    </main>
  );
}

function labelForFilter(f){
  if (f === 'none') return 'Tidak ada filter';
  // Capitalize and normalize labels
  return f.replace('xpro-ii','X-Pro II').replace('1977','1977').replace(/(^|\s)([a-z])/g, (m, s, c) => s + c.toUpperCase());
}

function filterClass(f){
  if (!f || f === 'none') return '';
  // Map to instagram.css class names
  const map = {
    'clarendon': 'filter-clarendon',
    'gingham': 'filter-gingham',
    'moon': 'filter-moon',
    'lofi': 'filter-lofi',
    'valencia': 'filter-valencia',
    'nashville': 'filter-nashville',
    '1977': 'filter-1977',
    'toaster': 'filter-toaster',
    'earlybird': 'filter-earlybird',
    'xpro-ii': 'filter-xpro-ii',
    'hudson': 'filter-hudson',
    'hefe': 'filter-hefe',
    'juno': 'filter-juno',
    'crema': 'filter-crema',
    'ludwig': 'filter-ludwig',
  };
  return map[f] || '';
}

function addStickersForPack(pack){
  const canvas = (fabricRef.current);
  if (!canvas) return;
  const common = { cornerStyle: 'circle', transparentCorners: false, cornerColor: '#cc857f', borderColor: '#cc857f' };
  canvas.discardActiveObject();
  switch(pack){
    case 'party':
      canvas.add(new fabric.Text('🎉 Party!', { left: 40, top: 40, fontSize: 36, fill: '#ff4d4f', ...common }));
      canvas.add(new fabric.Circle({ left: 180, top: 80, radius: 24, fill: '#ffd666', ...common }));
      break;
    case 'love':
      canvas.add(new fabric.Text('❤️ Love', { left: 60, top: 60, fontSize: 32, fill: '#eb2f96', ...common }));
      canvas.add(new fabric.Rect({ left: 210, top: 100, width: 60, height: 40, rx: 8, ry: 8, fill: '#ffadd2', ...common }));
      break;
    case 'summer':
      canvas.add(new fabric.Text('☀️ Summer', { left: 50, top: 50, fontSize: 32, fill: '#faad14', ...common }));
      canvas.add(new fabric.Triangle({ left: 220, top: 120, width: 60, height: 60, fill: '#69c0ff', ...common }));
      break;
    case 'royal':
      canvas.add(new fabric.Text('👑 Royal', { left: 40, top: 40, fontSize: 32, fill: '#9254de', ...common }));
      break;
    case 'spooky':
      canvas.add(new fabric.Text('🎃 Spooky', { left: 40, top: 40, fontSize: 32, fill: '#fa8c16', ...common }));
      break;
    case 'kawaii':
      canvas.add(new fabric.Text('💖 Kawaii', { left: 40, top: 40, fontSize: 32, fill: '#ff85c0', ...common }));
      break;
    case 'retro':
      canvas.add(new fabric.Text('📼 Retro', { left: 40, top: 40, fontSize: 32, fill: '#13c2c2', ...common }));
      break;
    case 'gamer':
      canvas.add(new fabric.Text('🎮 Gamer', { left: 40, top: 40, fontSize: 32, fill: '#52c41a', ...common }));
      break;
    default:
      // none: do nothing
      break;
  }
  canvas.renderAll();
}

function clearStickers(){
  const canvas = (fabricRef.current);
  if (!canvas) return;
  canvas.getObjects().forEach(o => canvas.remove(o));
  canvas.renderAll();
}

function labelForSticker(s){
  switch(s){
    case 'none': return 'Tidak ada stiker';
    case 'party': return 'Party Time';
    case 'love': return 'Love & Romance';
    case 'summer': return 'Summer Vibes';
    case 'royal': return 'Royal & Fantasy';
    case 'spooky': return 'Spooky & Halloween';
    case 'kawaii': return 'Cute & Kawaii';
    case 'retro': return 'Retro & Aesthetic';
    case 'gamer': return 'Gamer & Digital';
    default: return s;
  }
}

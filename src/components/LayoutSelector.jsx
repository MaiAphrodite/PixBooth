import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { layouts } from '../data/layouts.js';

export default function LayoutSelector() {
  const navigate = useNavigate();
  const clones = 2; // number of cloned items on each side
  const extended = useMemo(() => [...layouts.slice(-clones), ...layouts, ...layouts.slice(0, clones)], []);
  const [index, setIndex] = useState(clones); // start centered on first real item
  const [selected, setSelected] = useState(layouts[0].id);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardWidth = 260;
  const gap = 32;
  const [centerOffset, setCenterOffset] = useState(0);

  // Recalculate center offset on resize
  useEffect(() => {
    const computeOffset = () => {
      if (!viewportRef.current) return;
      const vw = viewportRef.current.offsetWidth;
      setCenterOffset((vw - cardWidth) / 2);
    };
    computeOffset();
    window.addEventListener('resize', computeOffset);
    return () => window.removeEventListener('resize', computeOffset);
  }, []);

  // Smooth infinite wrap using transitionend
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onEnd = (e) => {
      // Only handle transform transitions to avoid multiple triggers
      if (e.propertyName !== 'transform') return;
      
      if (index <= clones - 1) {
        setTransitionEnabled(false);
        setTimeout(() => {
          setIndex(index + layouts.length);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setTransitionEnabled(true));
          });
        }, 0);
      } else if (index >= layouts.length + clones) {
        setTransitionEnabled(false);
        setTimeout(() => {
          setIndex(index - layouts.length);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setTransitionEnabled(true));
          });
        }, 0);
      }
    };
    el.addEventListener('transitionend', onEnd);
    return () => el.removeEventListener('transitionend', onEnd);
  }, [index]);

  const trackStyle = useMemo(() => {
    const translate = -(index * (cardWidth + gap)) + centerOffset;
    return { transform: `translateX(${translate}px)` };
  }, [index, centerOffset]);

  const prev = () => setIndex(i => i - 1);
  const next = () => setIndex(i => i + 1);

  const handleSelect = (id, realIdx) => {
    setSelected(id);
    setIndex(realIdx + clones);
    navigate(`/booth?layout=${encodeURIComponent(id)}`);
  };

  return (
    <section className="layout-section" data-node-id="34:69">
      <h2 className="layout-title">Choose Your Photo Layout</h2>
      <p className="layout-desc">Sesuaikan tampilan fotomu dengan layout yang paling cocok untuk suasana acara!<br/>Pilihan layout yang bisa kamu gunakan:</p>
      <div className="peek-carousel" aria-roledescription="carousel">
        <button className="carousel-arrow prev" aria-label="Sebelumnya" onClick={prev} disabled={layouts.length < 2}>‹</button>
        <div className="carousel-viewport" ref={viewportRef}>
          <div ref={trackRef} className={`carousel-track ${transitionEnabled ? 'with-transition' : 'no-transition'}`} style={trackStyle}>
            {extended.map((l,i) => {
              // Determine real index for active state (mod original length)
              const realIdx = (i - clones + layouts.length) % layouts.length;
              const isActive = i === index;
              const isSelected = selected === l.id && i === index; // selected centered
              return (
                <div
                  key={`${l.id}-${i}`}
                  className={`layout-item ${isActive ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <div className="layout-image-wrapper">
                    <img src={l.image} alt={l.name} className="layout-image" />
                  </div>
                  <div className="layout-meta">
                    <div className="layout-name">{l.name}</div>
                    {l.poses > 1 && <div className="layout-poses">{l.poses} pose</div>}
                  </div>
                  <div className="layout-actions">
                    <button
                      className="choose-btn"
                      onClick={() => handleSelect(l.id, realIdx)}
                      aria-pressed={selected === l.id}
                    >
                      Pilih
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <button className="carousel-arrow next" aria-label="Berikutnya" onClick={next} disabled={layouts.length < 2}>›</button>
      </div>
    </section>
  );
}

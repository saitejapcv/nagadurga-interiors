import React, { useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';

const BeforeAfter = () => {
  const containerRef = useRef(null);
  const beforeRef = useRef(null);
  const handleRef = useRef(null);
  const isDragging = useRef(false);

  const updateSlider = useCallback((clientX) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    if (handleRef.current) handleRef.current.style.left = percent + '%';
    if (beforeRef.current) beforeRef.current.style.width = percent + '%';
  }, []);

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e) => {
    if (isDragging.current || e.buttons === 1) updateSlider(e.clientX);
  };
  const handleTouchMove = (e) => updateSlider(e.touches[0].clientX);

  return (
    <section className="ba-section">
      <div className="container">
        <div className="mono" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          Results / Before & After
        </div>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem', fontFamily: 'var(--font-display)', fontWeight: 400 }}>
          From Shell to Soul.
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div
            ref={containerRef}
            className="ba-container"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
          >
            <div className="ba-image ba-after">
              <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80" alt="After — fully furnished interior" loading="lazy" />
            </div>
            <div className="ba-image ba-before" ref={beforeRef}>
              <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1920&q=80" alt="Before — empty raw space" loading="lazy" />
            </div>
            <div className="ba-handle" ref={handleRef}></div>
            <div className="ba-label" style={{ left: '1.5rem' }}>Before</div>
            <div className="ba-label" style={{ right: '1.5rem' }}>After</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfter;

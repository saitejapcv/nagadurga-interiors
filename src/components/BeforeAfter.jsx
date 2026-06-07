import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

const BeforeAfter = () => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const [hasAnimated, setHasAnimated] = useState(false);

  // Run a fancy preview sweep animation when the component enters the viewport
  useEffect(() => {
    if (isInView && !hasAnimated) {
      // Settle at 50% after a quick visual cue to the user
      setTimeout(() => setPosition(80), 300);
      setTimeout(() => setPosition(20), 800);
      setTimeout(() => {
        setPosition(50);
        setHasAnimated(true);
      }, 1300);
    }
  }, [isInView, hasAnimated]);

  const handleMove = (clientX) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percent);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) { // Dragging with left mouse button
      handleMove(e.clientX);
    }
  };

  const handleClick = (e) => {
    handleMove(e.clientX);
  };

  return (
    <section className="ba-section" style={{ background: 'var(--bg)', padding: '6rem 0', overflow: 'hidden' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="mono" style={{ color: 'var(--accent)', display: 'block', marginBottom: '0.75rem' }}>
            Interactive Gallery / Before & After
          </span>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', 
            fontWeight: 400, 
            lineHeight: 1.2,
            color: 'var(--fg)' 
          }}>
            From Shell to Soul.
          </h2>
          <p style={{ color: 'var(--muted)', maxWidth: '500px', margin: '1rem auto 0', fontSize: '0.95rem' }}>
            Drag the slider or click anywhere on the frame to see our design transformation of a raw concrete shell in Kondapur.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ maxWidth: '950px', margin: '0 auto' }}
        >
          {/* Main Fancy Slider Container */}
          <div
            ref={containerRef}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/10',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 45px rgba(0,0,0,0.06)',
              cursor: 'ew-resize',
              userSelect: 'none',
              background: '#e5e5e5'
            }}
          >
            {/* AFTER IMAGE (Background - Full) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
              <img 
                src="/Photos/1/Bedroom/Master_bedroom.jpeg" 
                alt="After - Fully completed Master Bedroom by Nagadurga Interiors" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
              />
            </div>

            {/* BEFORE IMAGE (Foreground - Clipped width) */}
            <div 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                height: '100%', 
                width: `${position}%`,
                zIndex: 2, 
                overflow: 'hidden',
                borderRight: '2px solid white'
              }}
            >
              <img 
                src="/Photos/before.jpeg" 
                alt="Before - Empty raw concrete shell" 
                style={{ 
                  width: containerRef.current ? containerRef.current.getBoundingClientRect().width : '100vw', 
                  height: '100%', 
                  objectFit: 'cover', 
                  pointerEvents: 'none',
                  maxWidth: 'none'
                }} 
              />
            </div>

            {/* Floating Labels */}
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              zIndex: 4,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '0.4rem 1rem',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              Raw Shell
            </div>

            <div style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              zIndex: 4,
              background: 'var(--accent)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '0.4rem 1rem',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              Nagadurga Design
            </div>

            {/* Bottom-Center Info Badge */}
            <div style={{
              position: 'absolute',
              bottom: '1.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 4,
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border)',
              color: 'var(--fg)',
              padding: '0.6rem 1.5rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}>
              <span>Kondapur Suite</span>
              <span style={{ color: 'var(--accent)' }}>•</span>
              <span>45 Days Handover</span>
            </div>

            {/* Slider Handle (Central vertical divider) */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${position}%`,
                width: '0',
                zIndex: 3,
                pointerEvents: 'none'
              }}
            >
              {/* Pulsating Center Button */}
              <div 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0',
                  transform: 'translate(-50%, -50%)',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'ew-resize'
                }}
              >
                <span style={{ 
                  color: 'var(--accent)', 
                  fontSize: '0.9rem', 
                  fontWeight: 'bold', 
                  fontFamily: 'monospace',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translateY(-1px)'
                }}>
                  ↔
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfter;

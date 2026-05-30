import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const HeroSection = ({ onShowMaintenance }) => {
  const sectionRef = useRef(null);
  const h1Ref = useRef(null);
  const isInView = useInView(sectionRef, { once: true });

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 150]);

  const tagline = "Est. 2018 / Hyderabad";
  const headline = "Interiors that Tell Your Story.";

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.3 }
    }
  };

  const charVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12 } }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12 } }
  };

  return (
    <section className="hero" ref={sectionRef}>
      <div className="hero-content">
        <motion.div
          className="mono"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '1rem', color: 'var(--accent)' }}
        >
          {tagline.split('').map((char, i) => (
            <motion.span
              key={i}
              variants={charVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ delay: i * 0.04 }}
              style={{ display: 'inline-block' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.div>

        <motion.h1
          ref={h1Ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {headline.split(' ').map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              style={{ display: 'inline-block', marginRight: '0.3em' }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Full-home interior solutions designed for modern Hyderabad living.
          Transparent pricing, 45-day delivery, and Vastu-first planning.
        </motion.p>

        <motion.div
          className="cta-group"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <a className="btn btn-primary" onClick={onShowMaintenance} style={{ cursor: 'pointer' }}>
            Get Free Estimate
          </a>
          <a className="btn btn-secondary" href="#3d-offer">
            Claim Free 3D Design
          </a>
        </motion.div>


      </div>

      <motion.div
        className="hero-image"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
          alt="Modern Hyderabad Living Room by Nagadurga Interiors"
          loading="eager"
          style={{ y: parallaxY }}
        />
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, x: -30, rotate: -5 }}
          animate={isInView ? { opacity: 1, x: 0, rotate: -2 } : {}}
          transition={{ type: 'spring', damping: 10, delay: 1.4 }}
        >
          Verified 4.8/5 by 500+ Homeowners
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;

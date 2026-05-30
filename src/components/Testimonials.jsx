import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, useMotionValue, animate } from 'framer-motion';

const testimonials = [
  {
    name: 'Rajesh Reddy',
    location: '3BHK, Jubilee Hills',
    text: 'The way Nagadurga integrated Vastu into our modern layout was magical. The energy of the house shifted immediately, and the design is timeless.',
  },
  {
    name: 'Priya Sharma',
    location: 'Villa, Gachibowli',
    text: "True 'Quiet Luxury'. Every detail, from the warm tones to the brass accents, reflects a level of sophistication we hadn't found elsewhere in Hyderabad.",
  },
  {
    name: 'Aniruddh Rao',
    location: '2BHK, Kondapur',
    text: "Their approach to 'Energy Engineering' is a game changer. It's not just about looks; it's about how you feel in the space. Delivered in just 38 days!",
  },
];

const stats = [
  { value: 250, suffix: '+', label: 'Projects Delivered' },
  { value: 1.2, suffix: 'M', label: 'Sq Ft Transformed', decimal: true },
  { value: 99, suffix: '%', label: 'Client Happiness' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 12 }
  }
};

const CounterStat = ({ value, suffix, decimal }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplay(decimal ? latest.toFixed(1) : Math.floor(latest).toString());
      },
    });
    return () => controls.stop();
  }, [isInView, value, decimal]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
};

const Testimonials = () => {
  return (
    <>
      <section className="testimonials-section">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="mono" style={{ marginBottom: '1rem' }}>Testimonials</div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '0.5rem' }}>
              The Feeling of True Harmony
            </h2>
          </div>

          <motion.div
            className="testimonials-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {testimonials.map((t, i) => (
              <motion.div
                className="testimonial-card"
                key={i}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="quote-mark">"</div>
                <p>{t.text}</p>
                <div className="author">{t.name}</div>
                <div className="location">{t.location}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="container">
        <motion.div
          className="stats-row"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', damping: 12 }}
        >
          {stats.map((s, i) => (
            <div className="stat-item" key={i}>
              <div className="stat-value">
                <CounterStat value={s.value} suffix={s.suffix} decimal={s.decimal} />
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </>
  );
};

export default Testimonials;

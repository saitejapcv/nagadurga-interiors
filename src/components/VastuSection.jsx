import React from 'react';
import { motion } from 'framer-motion';

const checklist = [
  { label: 'Entryway', text: 'North, East, or North-East orientation for prosperity.' },
  { label: 'Kitchen', text: 'South-East placement to harness the fire element.' },
  { label: 'Master Bedroom', text: 'South-West positioning for stability and rest.' },
  { label: 'Colors', text: 'Palette selection based on room-specific cosmic energies.' },
  { label: 'Pooja Room', text: 'North-East corner for spiritual harmony and positive vibrations.' },
];

const VastuSection = () => {
  return (
    <section className="vastu-section">
      <div className="container">
        <div className="vastu-grid">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <div className="mono">Core Values</div>
            <h2>The Vastu Harmony Checklist</h2>
            <p>
              We ensure every Hyderabad home adheres to ancient wisdom paired with modern aesthetics.
            </p>
            <a href="#" className="btn btn-secondary" style={{ marginTop: '2rem', display: 'inline-block' }}>
              Download Full Guide
            </a>
          </motion.div>
          <ul className="vastu-list">
            {checklist.map((item, i) => (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', damping: 12 }}
              >
                <span className="check">✓</span>
                <span>
                  <strong>{item.label}:</strong> {item.text}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default VastuSection;

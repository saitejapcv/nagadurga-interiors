import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Vastu Science',
    description:
      'Every layout is optimized for positive energy flow, balancing the five elements for a harmonious Hyderabad home.',
  },
  {
    title: 'Tech-First Design',
    description:
      'Visualize your home in high-fidelity 3D before a single brick is moved. Precise and predictable.',
  },
  {
    title: 'Direct Sourcing',
    description:
      'We work directly with manufacturers to ensure the best materials at prices that respect your budget.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = [
  { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 12 } } },
  { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12 } } },
  { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 12 } } },
];

const FeatureGrid = () => {
  return (
    <div className="container">
      <motion.div
        className="feature-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {features.map((f, i) => (
          <motion.div
            className="feature-item"
            key={f.title}
            variants={itemVariants[i]}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="feature-line"></div>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FeatureGrid;

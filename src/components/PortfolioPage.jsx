import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const projects = [
  {
    title: 'The Jubilee Hills Minimalist',
    description: 'A study in white and oak, maximizing natural light in a compact 850 sq.ft. space.',
    img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    location: 'Jubilee Hills',
    budget: '₹8.2 Lakh',
    timeline: '40 Days',
    tags: ['jubilee-hills', '2bhk'],
  },
  {
    title: 'Gachibowli Lakeside',
    description: 'Integrating industrial textures with warm lighting for a young tech couple.',
    img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    location: 'Gachibowli',
    budget: '₹7.5 Lakh',
    timeline: '45 Days',
    tags: ['gachibowli', '2bhk'],
  },
  {
    title: 'Kondapur Modern Loft',
    description: 'Open-plan living with smart storage solutions for a family of four.',
    img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    location: 'Kondapur',
    budget: '₹12 Lakh',
    timeline: '55 Days',
    tags: ['kondapur', 'luxury'],
  },
  {
    title: 'Banjara Hills Heritage 3BHK',
    description: 'Traditional Hyderabadi arches blended with contemporary comfort.',
    img: 'https://images.unsplash.com/photo-1617806118233-18e1db207af1?auto=format&fit=crop&w=800&q=80',
    location: 'Banjara Hills',
    budget: '₹15.5 Lakh',
    timeline: '60 Days',
    tags: ['banjara-hills', 'luxury'],
  },
  {
    title: 'Kukatpally Smart Home',
    description: 'Budget-friendly interiors with integrated smart home automation.',
    img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    location: 'Kukatpally',
    budget: '₹6.5 Lakh',
    timeline: '35 Days',
    tags: ['kukatpally', '2bhk'],
  },
  {
    title: 'Manikonda Vastu Villa',
    description: 'A fully Vastu-compliant villa with earthy tones and natural materials.',
    img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    location: 'Manikonda',
    budget: '₹22 Lakh',
    timeline: '75 Days',
    tags: ['manikonda', 'luxury'],
  },
];

const FILTERS = [
  { id: 'all', label: 'All Projects' },
  { id: 'jubilee-hills', label: 'Jubilee Hills' },
  { id: 'gachibowli', label: 'Gachibowli' },
  { id: 'kondapur', label: 'Kondapur' },
  { id: '2bhk', label: '2BHK' },
  { id: 'luxury', label: 'Luxury' },
];

const PortfolioPage = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.tags.includes(activeFilter));

  return (
    <div className="page-enter">
      <div className="container">
        <motion.header
          className="portfolio-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <div className="mono">Selected Works</div>
          <h1>Homes with Soul.</h1>
          <p>
            Explore our archive of residential transformations across Hyderabad,
            where every space is a dialogue between tradition and modernity.
          </p>
        </motion.header>

        <div className="filter-bar">
          {FILTERS.map((f) => (
            <motion.span
              key={f.id}
              className={`filter-item ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ cursor: 'pointer' }}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {f.label}
            </motion.span>
          ))}
        </div>

        <motion.div
          className="portfolio-grid"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                className="portfolio-item"
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 15, delay: i * 0.05 }}
                whileHover={{
                  y: -5,
                  rotateX: 2,
                  rotateY: 2,
                  transition: { duration: 0.3 }
                }}
                style={{ perspective: 1000 }}
              >
                <div className="portfolio-image">
                  <motion.img
                    src={project.img}
                    alt={project.title}
                    loading="lazy"
                    initial={{ clipPath: 'circle(0% at 50% 50%)' }}
                    animate={{ clipPath: 'circle(100% at 50% 50%)' }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
                <div className="item-info">
                  <h3>{project.title}</h3>
                  <div className="item-meta">
                    <div>
                      Location <b>{project.location.toUpperCase()}</b>
                    </div>
                    <div>
                      Budget <b>{project.budget.toUpperCase()}</b>
                    </div>
                    <div>
                      Timeline <b>{project.timeline.toUpperCase()}</b>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <footer className="portfolio-footer">
          <div className="mono" style={{ marginBottom: '2rem' }}>
            Ready to build your story?
          </div>
          <motion.a
            className="btn btn-primary"
            onClick={() => onNavigate('calculator')}
            style={{ cursor: 'pointer' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Estimate
          </motion.a>
        </footer>
      </div>
    </div>
  );
};

export default PortfolioPage;

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { defaultProjects } from '../data/defaultProjects';

const statItems = [
  { value: 420, suffix: '+', label: 'Projects Completed in Hyderabad' },
  { value: 45, suffix: ' Days', label: 'Average Timeline' },
  { value: 6.5, prefix: '₹', suffix: ' Lakhs', label: 'Starting From', decimal: true },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12 } }
};

const AnimatedStat = ({ value, suffix, prefix = '', decimal }) => {
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

  return <span ref={ref}>{prefix}{display}{suffix}</span>;
};

const BhkLanding = ({ onNavigate }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchBhkProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        let allProjects = [];
        if (querySnapshot.empty) {
          allProjects = defaultProjects;
        } else {
          allProjects = querySnapshot.docs.map(doc => doc.data());
        }
        const filtered = allProjects.filter(p => p.tags && p.tags.includes('2bhk')).slice(0, 3);
        setProjects(filtered);
      } catch (err) {
        console.error("Error loading projects in BhkLanding:", err);
        const filtered = defaultProjects.filter(p => p.tags && p.tags.includes('2bhk')).slice(0, 3);
        setProjects(filtered);
      }
    };
    fetchBhkProjects();
  }, []);

  return (
    <div className="page-enter">
      <div className="container">
        <motion.header
          className="bhk-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <div className="mono">Hyderabad / 2BHK Specialist</div>
          <h1>Optimized Living for the Hyderabad Home.</h1>
        </motion.header>

        <section className="bhk-intro">
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
          >
            Space is luxury in Hyderabad's booming neighborhoods. We specialize in
            transforming 2BHK apartments in Jubilee Hills, Gachibowli, and Kondapur
            into expansive, light-filled sanctuaries using smart multi-functional design.
          </motion.p>
          <motion.div
            className="bhk-stats"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', damping: 12, delay: 0.4 }}
          >
            {statItems.map((s, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <AnimatedStat value={s.value} suffix={s.suffix} prefix={s.prefix} decimal={s.decimal} />
                <span style={{ opacity: 0.6, marginLeft: '0.5rem' }}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </section>

        <motion.div
          className="project-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {projects.map((project, i) => (
            <motion.div
              className="project-card"
              key={i}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="project-card-image">
                <motion.img
                  src={project.img}
                  alt={project.title}
                  loading="lazy"
                  initial={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' }}
                  whileInView={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                />
              </div>
              <div className="project-details">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="metadata">
                  <div className="metadata-item">
                    <span>AREA</span>
                    {(project.location || project.city || 'HYDERABAD').toUpperCase()}
                  </div>
                  <div className="metadata-item">
                    <span>BUDGET</span>
                    {project.budget.toUpperCase()}
                  </div>
                  <div className="metadata-item">
                    <span>TIMELINE</span>
                    {project.timeline.toUpperCase()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.section
        className="experience-section"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: 'spring', damping: 12 }}
      >
        <div className="container">
          <div className="mono" style={{ marginBottom: '1rem', opacity: 0.7 }}>
            Experience Center
          </div>
          <h2>View Our Completed Projects.</h2>
          <p>
            Explore our portfolio of completed interior projects across Hyderabad. See the quality of our work firsthand.
          </p>
          <motion.a
            href="#/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.preventDefault(); onNavigate('portfolio'); }}
          >
            View Portfolio
          </motion.a>
        </div>
      </motion.section>

      <div className="container">
        <motion.div
          className="cta-box"
          initial={{ opacity: 0, clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' }}
          whileInView={{ opacity: 1, clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
        >
          <h2>Ready for your Hyderabad home?</h2>
          <p>Start with our interactive price tool or chat with us directly.</p>
          <div className="cta-box-actions">
            <motion.a
              className="btn btn-primary"
              onClick={() => onNavigate('calculator')}
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Estimate
            </motion.a>
            <motion.a
              href="https://wa.me/918523013312?text=Hi,%20I'm%20interested%20in%20a%202BHK%20interior%20in%20Hyderabad."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              WhatsApp Us
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BhkLanding;

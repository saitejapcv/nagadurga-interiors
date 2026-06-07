import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { defaultProjects } from '../data/defaultProjects';

function formatTagLabel(tag) {
  if (!tag) return '';
  if (tag.toLowerCase() === '2bhk') return '2BHK';
  if (tag.toLowerCase() === '3bhk') return '3BHK';
  return tag
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const PortfolioPage = ({ onNavigate }) => {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Gallery modal states
  const [activeImg, setActiveImg] = useState(null);
  const [galleryCategory, setGalleryCategory] = useState('All');

  // Load projects from Firestore on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        if (querySnapshot.empty) {
          setProjects(defaultProjects);
        } else {
          const projList = querySnapshot.docs.map(doc => doc.data());
          setProjects(projList);
        }
      } catch (err) {
        console.error("Error loading projects from Firestore:", err);
        setProjects(defaultProjects);
      }
    };
    fetchProjects();
  }, []);

  const filters = React.useMemo(() => {
    const counts = {};
    projects.forEach(p => {
      if (p.tags) {
        p.tags.forEach(t => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    
    const sortedTags = Object.entries(counts)
      .map(([tag, count]) => ({
        id: tag,
        label: formatTagLabel(tag),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
      
    return [
      { id: 'all', label: 'All Projects' },
      ...sortedTags
    ];
  }, [projects]);

  useEffect(() => {
    if (activeFilter !== 'all' && !filters.some(f => f.id === activeFilter)) {
      setActiveFilter('all');
    }
  }, [filters, activeFilter]);

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.tags && p.tags.includes(activeFilter));

  const handleOpenModal = (project) => {
    setSelectedProject(project);
    setGalleryCategory('All');
    if (project.gallery && project.gallery.length > 0) {
      setActiveImg(project.gallery[0]);
    } else {
      setActiveImg({ url: project.img, category: 'Cover', title: 'Cover Image' });
    }
    // Lock scroll
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    setActiveImg(null);
    // Restore scroll
    document.body.style.overflow = 'auto';
  };

  // Filter project gallery by active category in modal
  const getFilteredGallery = (project) => {
    if (!project.gallery || project.gallery.length === 0) {
      return [{ url: project.img, category: 'Cover', title: 'Cover Image' }];
    }
    if (galleryCategory === 'All') return project.gallery;
    return project.gallery.filter(item => item.category === galleryCategory);
  };

  // Get list of unique categories in project gallery
  const getProjectCategories = (project) => {
    if (!project.gallery || project.gallery.length === 0) return [];
    const cats = new Set(project.gallery.map(item => item.category));
    return ['All', ...Array.from(cats)];
  };

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
            where every space is a dialogue between tradition and modernity. Click on a project to inspect individual room photos.
          </p>
        </motion.header>

        <div className="filter-bar">
          {filters.map((f) => (
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
                key={project.id || project.title}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 15, delay: i * 0.05 }}
                onClick={() => handleOpenModal(project)}
                whileHover={{
                  y: -5,
                  rotateX: 1,
                  rotateY: 1,
                  transition: { duration: 0.3 }
                }}
                style={{ perspective: 1000, cursor: 'pointer' }}
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
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.5rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description}
                  </p>
                  <div className="item-meta">
                    <div>
                      Location <b>{project.location ? project.location.toUpperCase() : 'HYDERABAD'}</b>
                    </div>
                    <div>
                      Budget <b>{project.budget ? project.budget.toUpperCase() : '₹10 Lakh'}</b>
                    </div>
                    <div>
                      Timeline <b>{project.timeline ? project.timeline.toUpperCase() : '45 Days'}</b>
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

      {/* Immersive Room Photo Gallery Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="gallery-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              padding: '2rem',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div>
                <span className="mono" style={{ color: 'var(--accent)' }}>Completed Project Showcase</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginTop: '0.25rem' }}>{selectedProject.title}</h2>
              </div>
              <button 
                onClick={handleCloseModal}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
              >
                ✕ Close Gallery
              </button>
            </div>

            {/* Modal Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '2.5rem', flex: 1, minHeight: 0 }}>
              {/* Large Image Frame */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#f5f5f5', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', aspectRatio: '4/3' }}>
                <AnimatePresence mode="wait">
                  {activeImg && (
                    <motion.img
                      key={activeImg.url}
                      src={activeImg.url}
                      alt={activeImg.title || selectedProject.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  )}
                </AnimatePresence>
                {activeImg && activeImg.category && (
                  <div style={{
                    position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.4rem 0.85rem', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    {activeImg.category}
                  </div>
                )}
              </div>

              {/* Sidebar: Details, Categories and Thumbnails */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', maxHeight: '75vh', paddingRight: '0.5rem' }} className="modal-sidebar">
                {/* Text Details */}
                <div>
                  <h4 className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>Project Profile</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--fg)', lineHeight: '1.6', marginBottom: '1rem' }}>
                    {selectedProject.description}
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
                    <div>
                      <span className="mono" style={{ display: 'block', fontSize: '0.6rem', color: 'var(--muted)' }}>Location</span>
                      <strong style={{ fontSize: '0.85rem' }}>{selectedProject.location}</strong>
                    </div>
                    <div>
                      <span className="mono" style={{ display: 'block', fontSize: '0.6rem', color: 'var(--muted)' }}>Budget</span>
                      <strong style={{ fontSize: '0.85rem' }}>{selectedProject.budget}</strong>
                    </div>
                    <div>
                      <span className="mono" style={{ display: 'block', fontSize: '0.6rem', color: 'var(--muted)' }}>Timeline</span>
                      <strong style={{ fontSize: '0.85rem' }}>{selectedProject.timeline}</strong>
                    </div>
                  </div>
                </div>

                {/* Photo details caption */}
                {activeImg && (
                  <div style={{ background: 'var(--bg)', padding: '1rem', border: '1px solid var(--border)', borderRadius: '2px' }}>
                    <span className="mono" style={{ display: 'block', fontSize: '0.6rem', color: 'var(--accent)' }}>Active Photo Caption</span>
                    <strong style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', display: 'block', marginTop: '0.25rem' }}>
                      {activeImg.title || 'Completed Space Design'}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      Folder Category: {activeImg.category}
                    </span>
                  </div>
                )}

                {/* Subdirectory / Room Category Tabs */}
                {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                  <div>
                    <h4 className="mono" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>Filter Photos by Room</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {getProjectCategories(selectedProject).map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            setGalleryCategory(cat);
                            // Set first item in category as active
                            const catItems = cat === 'All' ? selectedProject.gallery : selectedProject.gallery.filter(i => i.category === cat);
                            if (catItems.length > 0) setActiveImg(catItems[0]);
                          }}
                          style={{
                            padding: '0.3rem 0.75rem',
                            fontSize: '0.7rem',
                            fontFamily: 'var(--font-mono)',
                            border: '1px solid var(--border)',
                            borderRadius: '15px',
                            background: galleryCategory === cat ? 'var(--fg)' : 'transparent',
                            color: galleryCategory === cat ? 'var(--bg)' : 'var(--fg)',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thumbnail list */}
                <div>
                  <h4 className="mono" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>Photo Gallery</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {getFilteredGallery(selectedProject).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveImg(item)}
                        style={{
                          aspectRatio: '1',
                          border: activeImg && activeImg.url === item.url ? '2px solid var(--accent)' : '1px solid var(--border)',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          background: '#e0e0e0',
                          opacity: activeImg && activeImg.url === item.url ? 1 : 0.7,
                          transition: 'opacity 0.2s ease'
                        }}
                      >
                        <img src={item.url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioPage;

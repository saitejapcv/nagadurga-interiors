import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TrustBar from './components/TrustBar';
import BeforeAfter from './components/BeforeAfter';
import FeatureGrid from './components/FeatureGrid';
import VastuSection from './components/VastuSection';
import FreeDesignOffer from './components/FreeDesignOffer';
import Testimonials from './components/Testimonials';
import PortfolioPage from './components/PortfolioPage';
import Calculator from './components/Calculator';
import BhkLanding from './components/BhkLanding';
import WhatsAppWidget from './components/WhatsAppWidget';
import Footer from './components/Footer';
import AdminPage from './components/AdminPage';

const cleanPaths = {
  '/portfolio': '/#/portfolio',
  '/portfolio/': '/#/portfolio',
  '/calculator': '/#/calculator',
  '/calculator/': '/#/calculator',
  '/price-tool': '/#/calculator',
  '/price-tool/': '/#/calculator',
  '/hyderabad': '/#/hyderabad',
  '/hyderabad/': '/#/hyderabad',
  '/admin': '/#/admin',
  '/admin/': '/#/admin',
};

const currentPath = window.location.pathname;
if (cleanPaths[currentPath]) {
  window.history.replaceState({}, '', cleanPaths[currentPath]);
}

function getPageFromHash() {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (hash) {
    if (hash === 'portfolio') return 'portfolio';
    if (hash === 'calculator') return 'calculator';
    if (hash === 'hyderabad') return 'hyderabad';
    if (hash === 'admin') return 'admin';
    if (hash === 'home') return 'home';
  }
  
  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  if (path === 'admin') return 'admin';
  
  return 'home';
}

function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromHash);

  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  const navigate = (page) => {
    if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
      setCurrentPage('admin');
    } else if (window.location.pathname !== '/' && page !== 'admin') {
      window.history.pushState({}, '', '/' + (page === 'home' ? '' : '#/' + page));
      setCurrentPage(page);
    } else {
      window.location.hash = '#/' + page;
      setCurrentPage(page);
    }
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'portfolio':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <PortfolioPage onNavigate={navigate} />
            </motion.div>
          </AnimatePresence>
        );
      case 'calculator':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Calculator />
            </motion.div>
          </AnimatePresence>
        );
      case 'hyderabad':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="hyderabad"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <BhkLanding onNavigate={navigate} />
            </motion.div>
          </AnimatePresence>
        );
      case 'admin':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <AdminPage onNavigate={navigate} />
            </motion.div>
          </AnimatePresence>
        );
      default:
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="container">
                <HeroSection />
              </div>
              <TrustBar />
              <BeforeAfter />
              <FeatureGrid />
              <VastuSection />
              <Testimonials />
              <FreeDesignOffer />
            </motion.div>
          </AnimatePresence>
        );
    }
  };

  return (
    <>
      <Navbar currentPage={currentPage} onNavigate={navigate} />
      <main>{renderPage()}</main>
      <Footer onNavigate={navigate} />
      <WhatsAppWidget />
    </>
  );
}

export default App;

import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      className="site-footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <div className="footer-inner">
          <div className="footer-logo">Nagadurga Interiors</div>
          <div className="footer-copy">
            © {new Date().getFullYear()} Nagadurga Interiors, Hyderabad. All Rights Reserved.
          </div>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;

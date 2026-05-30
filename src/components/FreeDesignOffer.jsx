import React from 'react';
import { motion } from 'framer-motion';

const WHATSAPP_NUMBER = '918523013312';

const FreeDesignOffer = () => {
  return (
    <motion.section
      className="free-offer"
      id="3d-offer"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: 'spring', damping: 12 }}
    >
      <div className="container">
        <div className="mono">Limited Time Offer</div>
        <h2>See Your Future Home in 3D.</h2>
        <p>
          Book a free consultation this week and get a detailed 3D render of your
          living room — worth ₹15,000 — absolutely free.
        </p>
        <motion.a
          className="btn"
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'd like to book a free consultation for home interior design. I'm interested in the free 3D render offer.")}`}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Book Consultation
        </motion.a>
      </div>
    </motion.section>
  );
};

export default FreeDesignOffer;

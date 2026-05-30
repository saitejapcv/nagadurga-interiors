import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MaintenanceToast = ({ show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="maintenance-toast"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 15 }}
          onClick={onClose}
        >
          <span className="toast-icon">🚧</span>
          <span>This page is under maintenance. We'll be back soon!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MaintenanceToast;

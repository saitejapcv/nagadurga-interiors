import React, { useState, useEffect } from 'react';

const Navbar = ({ currentPage, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHome = () => {
    onNavigate('home');
    setIsOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container">
      <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
        <a className="logo" onClick={handleHome} style={{ cursor: 'pointer' }}>
          Nagadurga Interiors
        </a>

        <button
          className={`nav-toggle ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </div>
  );
};

export default Navbar;

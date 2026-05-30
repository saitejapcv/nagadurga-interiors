import React, { useState, useEffect } from 'react';

const Navbar = ({ currentPage, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const links = [
    { name: 'Portfolio', page: 'portfolio' },
    { name: 'Price Tool', page: 'calculator' },
    { name: 'Hyderabad', page: 'hyderabad' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page) => {
    onNavigate(page);
    setIsOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container">
      <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
        <a className="logo" onClick={() => handleNav('home')} style={{ cursor: 'pointer' }}>
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

        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          {links.map((link) => (
            <a
              key={link.page}
              className={currentPage === link.page ? 'active' : ''}
              onClick={() => handleNav(link.page)}
              style={{ cursor: 'pointer' }}
            >
              {link.name}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

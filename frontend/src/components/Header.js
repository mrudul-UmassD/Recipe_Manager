import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={`${styles.headerContainer} container`}>
        <Link to="/" className={styles.logo}>
          <i className="fas fa-utensils"></i>
          Recipe Manager
        </Link>

        <button className={styles.menuButton} onClick={toggleMobileMenu}>
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/add-recipe" className={styles.navLink}>Add Recipe</Link>
        </nav>

        {mobileMenuOpen && (
          <nav className={styles.mobileNav}>
            <Link to="/" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Home</Link>
            <Link to="/add-recipe" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Add Recipe</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 
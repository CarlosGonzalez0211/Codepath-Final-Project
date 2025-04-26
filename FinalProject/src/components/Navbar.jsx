import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const { pathname } = useLocation();

  const isActive = (path) => pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">🎬 Movie Forum</Link>
        <div className="navbar-links">
          <Link to="/" className={isActive('/') ? 'nav-link active' : 'nav-link'}>
            Home
          </Link>
          <Link to="/create" className={isActive('/create') ? 'nav-link active' : 'nav-link'}>
            Submit Review
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

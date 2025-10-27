// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/95 backdrop-blur-sm py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 lg:px-12">
        <Link to="/" className="text-2xl lg:text-3xl font-black tracking-tighter">
          <span className="text-white">WALLD'S </span>
          <span className="text-[#d4af37] ml-1">BARBERS</span>
        </Link>

        <ul className="hidden lg:flex space-x-10 font-medium text-sm tracking-wider">
          {[
            { name: 'INICIO', href: '/' },
            { name: 'SERVICIOS', href: '#servicios' },
            { name: 'NOSOTROS', href: '#nosotros' },
          ].map((item) => (
            <li key={item.name}>
              <a href={item.href} className="text-white/90 hover:text-[#d4af37] transition-colors duration-300">
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        <button className="lg:hidden text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
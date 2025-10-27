// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Throttle con requestAnimationFrame
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "INICIO", href: "/" },
    { name: "SERVICIOS", href: "#servicios" },
    { name: "NOSOTROS", href: "#nosotros" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black/95 backdrop-blur-sm py-3" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 lg:px-12">
        <Link
          to="/"
          className="text-2xl lg:text-3xl font-black tracking-tighter select-none"
        >
          <span className="text-white">WALLD'S</span>
          <span className="text-[#d4af37] ml-1">BARBERS</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex space-x-10 font-medium text-sm tracking-wider">
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="text-white/90 hover:text-[#d4af37] transition-colors duration-300 ease-in-out"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Button */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="lg:hidden text-white focus:outline-none"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col items-center bg-black/90 backdrop-blur-md py-4 space-y-4 text-sm tracking-wider">
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-white/90 hover:text-[#d4af37] transition-colors duration-300"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
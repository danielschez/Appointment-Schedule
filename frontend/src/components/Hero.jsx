// src/components/Hero.jsx
import React from "react";

const Hero = () => {
  return (
    <header className="relative h-screen bg-black overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center hero-image"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      <div className="relative h-full flex flex-col justify-center items-start max-w-7xl mx-auto px-6 lg:px-12 z-10">
        <div className="max-w-3xl">
          <div className="overflow-hidden mb-4">
            <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white leading-none tracking-tighter slide-up mb-4">
              ESTILO
            </h1>
          </div>
          <div className="overflow-hidden mb-8">
            <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-[#d4af37] leading-none tracking-tighter slide-up-delay">
              CLÁSICO
            </h1>
          </div>

          <p className="text-white/80 text-lg md:text-xl mb-12 max-w-xl fade-in-up" style={{animationDelay: '0.4s'}}>
            Barbería tradicional con estilo moderno. Experimenta el arte del corte perfecto.
          </p>

          <a href="#servicios" className="inline-block bg-[#d4af37] text-black px-10 py-4 font-bold text-sm tracking-wider hover:bg-white transition-all duration-300 fade-in-up" style={{animationDelay: '0.6s'}}>
            VER SERVICIOS
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </header>
  );
};

export default Hero;
// src/components/Hero.jsx
import React, { useState } from "react";

const Hero = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <header className="relative h-screen bg-black overflow-hidden">
      {/* Imagen de fondo LCP optimizada */}
      <div className="absolute inset-0 bg-black">
        <img
          src="../public/photo.avif"
          srcSet="/photo.avif 480w, /photo.avif 768w, /photo.avif 1024w"
          sizes="(max-width: 768px) 100vw, 100vw"
          alt="Barbería clásica"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Contenido del hero */}
      <div className="relative h-full flex flex-col justify-center items-start max-w-7xl mx-auto px-6 lg:px-12 z-10">
        <div className="max-w-3xl">
          <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white leading-none tracking-tighter animate-slide-up mb-4">
            ESTILO
          </h1>
          <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-[#d4af37] leading-none tracking-tighter animate-slide-up-delay mb-8">
            CLÁSICO
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-xl animate-fade-in-delay mb-12">
            Barbería tradicional con estilo moderno. Experimenta el arte del corte perfecto.
          </p>
          <a
            href="#servicios"
            className="inline-block bg-[#d4af37] text-black px-10 py-4 font-bold text-sm tracking-wider hover:bg-white transition-all duration-300 animate-fade-in-delay"
          >
            VER SERVICIOS
          </a>
        </div>
      </div>

      {/* Gradiente inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </header>
  );
};

export default Hero;

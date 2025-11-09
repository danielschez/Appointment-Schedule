import React, { useState, useEffect } from "react";

const About = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const images = [
    {
      url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80",
      alt: "Modern barbershop interior"
    },
    {
      url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
      alt: "Professional barber at work"
    },
    {
      url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80",
      alt: "Classic haircut service"
    },
    {
      url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80",
      alt: "Traditional shaving experience"
    }
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImage(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      nextImage();
    }, 4000);

    return () => clearInterval(interval);
  }, [currentImage, isAutoPlaying]);

  return (
    <section id="nosotros" className="py-32 bg-gradient-to-b from-[#0f0f0f] via-[#222222] to-[#0f0f0f] relative">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="w-20 h-[3px] bg-[#e8c547]"></div>
            <h2 className="text-6xl font-black leading-none tracking-tighter">
              TRADICIÓN<br />ENCUENTRA<br /><span className="text-[#e8c547]">ESTILO</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              En <strong className="text-[#e8c547] font-black">WALLD'S BARBER</strong>, creemos en el arte de la barbería tradicional. Nuestros maestros barberos combinan décadas de experiencia con técnicas de vanguardia.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Desde 2010, hemos sido el destino para quienes exigen excelencia en cuidado personal. Cada corte, cada afeitado, cada detalle importa.
            </p>
            <div className="flex gap-12 pt-8">
              <div>
                <div className="text-5xl font-black text-[#e8c547] mb-2">15+</div>
                <div className="text-gray-400 text-sm uppercase tracking-widest">Años</div>
              </div>
              <div>
                <div className="text-5xl font-black text-[#e8c547] mb-2">10K+</div>
                <div className="text-gray-400 text-sm uppercase tracking-widest">Clientes</div>
              </div>
              <div>
                <div className="text-5xl font-black text-[#e8c547] mb-2">5</div>
                <div className="text-gray-400 text-sm uppercase tracking-widest">Barberos</div>
              </div>
            </div>
          </div>
          
          {/* Carousel */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-[#e8c547]/10 blur-3xl group-hover:bg-[#e8c547]/20 transition-all duration-700"></div>
            
            {/* Main image container */}
            <div className="relative overflow-hidden shadow-2xl border-4 border-[#e8c547]/20">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentImage * 100}%)` }}
              >
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.alt}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="w-full h-[500px] object-cover flex-shrink-0"
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <button
                onClick={() => {
                  prevImage();
                  setIsAutoPlaying(false);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#e8c547] text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>

              <button
                onClick={() => {
                  nextImage();
                  setIsAutoPlaying(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#e8c547] text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`transition-all duration-300 rounded-full ${
                      currentImage === index
                        ? "w-10 h-3 bg-[#e8c547]"
                        : "w-3 h-3 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>

              {/* Image counter */}
              <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-bold">
                {currentImage + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
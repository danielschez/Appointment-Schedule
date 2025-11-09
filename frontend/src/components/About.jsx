import React, { useState, useEffect } from "react";

const About = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const images = [
    { url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80", alt: "Modern barbershop interior" },
    { url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80", alt: "Professional barber at work" },
    { url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80", alt: "Classic haircut service" },
    { url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80", alt: "Traditional shaving experience" }
  ];

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  const goToImage = (index) => {
    setCurrentImage(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextImage, 4000);
    return () => clearInterval(interval);
  }, [currentImage, isAutoPlaying]);

  return (
    <section id="nosotros" className="py-32 bg-gradient-to-b from-[#0f0f0f] via-[#222222] to-[#0f0f0f] relative">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Texto */}
          <div className="space-y-8">
            <div className="w-20 h-[3px] bg-[#e8c547]"></div>
            <h2 className="text-6xl font-black leading-none tracking-tighter text-[#e8c547]">
              MÁS QUE UN CORTE, UNA EXPERIENCIA DE ESTILO
            </h2>
            <p className="text-gray-200 text-lg leading-relaxed">
              En nuestra barbería no solo te ofrecemos cortes impecables, sino una experiencia de cuidado personal incomparable. Nuestros barberos están dedicados a resaltar tu estilo y realzar tu confianza. Ven y relájate en un ambiente moderno y acogedor. Desde cortes clásicos hasta tendencias de vanguardia, saldrás luciendo y sintiéndote increíble. ¡Descubre la diferencia en <strong className="text-[#e8c547] font-black">WALLD'S BARBER</strong>!
            </p>
          </div>

          {/* Carousel */}
          <div className="relative group">
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

              {/* Controles */}
              <button
                onClick={() => { prevImage(); setIsAutoPlaying(false); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-full hover:bg-[#e8c547] transition duration-300"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <button
                onClick={() => { nextImage(); setIsAutoPlaying(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-full hover:bg-[#e8c547] transition duration-300"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>

              {/* Indicadores */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    aria-label={`Go to image ${index + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      currentImage === index ? "w-10 h-3 bg-[#e8c547]" : "w-3 h-3 bg-white hover:bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Contador */}
              <div className="absolute top-6 right-6 bg-black px-4 py-2 rounded-full text-white text-sm font-bold">
                {currentImage + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="mt-24 text-center">
          <h3 className="text-3xl font-bold text-[#e8c547] mb-6">Encuéntranos aquí</h3>
          <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-2xl border border-[#e8c547]/30">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3732.616005022502!2d-100.3249378!3d20.5921483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d34315806ac4a7%3A0xb553b50261d3993d!2sBarberia%20y%20Peluqueria%20Walld%E2%80%99s%20Quer%C3%A9taro!5e0!3m2!1ses!2smx!4v1731135600000!5m2!1ses!2smx"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Barbería y Peluquería Walld’s Querétaro"
            ></iframe>
          </div>

          {/* Botón Cómo llegar */}
          <div className="mt-6 flex justify-center">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Barberia+y+Peluqueria+Wallds+Quer%C3%A9taro,+Quer%C3%A9taro"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#e8c547] text-[#e8c547] font-semibold tracking-wide uppercase rounded-md hover:bg-[#e8c547] hover:text-black transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l4 8-4 4-4-4 4-8zM12 22v-8" />
              </svg>
              Cómo llegar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

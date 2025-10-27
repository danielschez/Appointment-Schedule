// src/components/About.jsx
import React from "react";

const About = () => (
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
        
        <div className="relative group">
          <div className="absolute -inset-4 bg-[#e8c547]/10 blur-3xl group-hover:bg-[#e8c547]/20 transition-all duration-700"></div>
          <img src="https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80" 
               alt="Barbershop" 
               loading="lazy"
               className="relative shadow-2xl hover:scale-105 transition-transform duration-700 border-4 border-[#e8c547]/20" />
        </div>
      </div>
    </div>
  </section>
);

export default About;
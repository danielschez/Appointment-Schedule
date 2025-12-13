// src/components/Services.jsx
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const formatDuration = (durationStr) => {
  if (!durationStr) return '0min';
  
  const parts = durationStr.split(':');
  const horas = parseInt(parts[0], 10);
  const minutos = parseInt(parts[1], 10);
  
  if (horas > 0 && minutos > 0) {
    return `${horas}h ${minutos}min`;
  } else if (horas > 0) {
    return `${horas}h`;
  } else {
    return `${minutos}min`;
  }
};

const Services = () => {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL;

  const imagenesDefault = {
    'corte': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
    'afeitado': 'https://images.unsplash.com/photo-1604079628040-94301bb21b87?auto=format&fit=crop&w=600&q=80',
    'barba': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
    'tinte': 'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=600&q=80',
    'diseno': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    'default': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80'
  };

  const obtenerImagen = (nombreServicio) => {
    const nombre = nombreServicio.toLowerCase();
    
    if (nombre.includes('corte')) return imagenesDefault.corte;
    if (nombre.includes('afeitado') || nombre.includes('afeitar')) return imagenesDefault.afeitado;
    if (nombre.includes('barba')) return imagenesDefault.barba;
    if (nombre.includes('tinte') || nombre.includes('color')) return imagenesDefault.tinte;
    if (nombre.includes('diseño') || nombre.includes('diseno')) return imagenesDefault.diseno;
    
    return imagenesDefault.default;
  };

  const obtenerUrlImagen = (servicio) => {
    if (servicio.image) {
      if (servicio.image.startsWith('http://') || servicio.image.startsWith('https://')) {
        return servicio.image;
      }
      const baseUrl = API_BASE.replace(/\/api\/?$/, '');
      return `${baseUrl}${servicio.image}`;
    }
    return obtenerImagen(servicio.name);
  };

  useEffect(() => {
    const fetchServicios = async () => {
      setCargando(true);
      setError(null);

      try {
        const url = `${API_BASE}/service/`;
        const response = await axios.get(url);
        const serviciosData = response.data;

        setServicios(Array.isArray(serviciosData) ? serviciosData : []);
      } catch (err) {
        console.error('Error al cargar servicios:', err);
        setError(err.message);
        setServicios([]);
      } finally {
        setCargando(false);
      }
    };

    fetchServicios();
  }, [API_BASE]);

  const handleReservar = (servicio) => {
    sessionStorage.setItem('servicioSeleccionado', JSON.stringify(servicio));
    navigate('/calendario');
  };

  const handleImageError = (e, nombreServicio) => {
    console.warn(`Error al cargar imagen para ${nombreServicio}, usando imagen por defecto`);
    e.target.src = obtenerImagen(nombreServicio);
  };

  // Estado de carga
  if (cargando) {
    return (
      <section id="servicios" className="py-32 bg-[#0f0f0f] relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#e8c547] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-xl">Cargando servicios...</p>
        </div>
      </section>
    );
  }

  // Estado de error
  if (error) {
    return (
      <section id="servicios" className="py-32 bg-[#0f0f0f] relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 text-xl mb-4">Error al cargar servicios</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-[#e8c547] text-black font-bold uppercase tracking-wider hover:bg-[#d4b540] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="servicios" className="py-32 bg-[#0f0f0f] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#222222]/30 via-transparent to-[#222222]/30"></div>
      
      <div className="relative max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <div className="w-20 h-[3px] bg-[#e8c547] mx-auto mb-8"></div>
          <h2 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter">
            NUESTROS <span className="text-[#e8c547]">SERVICIOS</span>
          </h2>
          <p className="text-gray-400 uppercase tracking-widest text-sm">Excelencia en Cada Corte</p>
        </div>

        {servicios.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No hay servicios disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-12">
            {servicios.map((serv) => (
              <div 
                key={serv.id} 
                className="group relative bg-[#222222] overflow-hidden hover:scale-105 transition-all duration-700 shadow-2xl border border-[#e8c547]/0 hover:border-[#e8c547]/30"
              >
                {/* Imagen del servicio */}
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={obtenerUrlImagen(serv)}
                    alt={serv.name} 
                    loading="lazy"
                    onError={(e) => handleImageError(e, serv.name)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 brightness-75 group-hover:brightness-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent"></div>
                  
                  {/* Precio */}
                  <div className="absolute top-6 right-6 bg-[#e8c547] text-black px-6 py-3 font-black text-xl tracking-tighter">
                    ${serv.price}
                  </div>

                  {/* Duración */}
                  <div className="absolute bottom-6 left-6 bg-black/70 text-[#e8c547] px-4 py-2 font-bold text-sm tracking-wider backdrop-blur-sm">
                    {formatDuration(serv.duration)}
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="p-10 bg-[#222222]">
                  <h3 className="text-2xl font-black mb-4 text-white group-hover:text-[#e8c547] transition-colors duration-500 tracking-tighter uppercase">
                    {serv.name}
                  </h3>
                  
                  {serv.description && (
                    <p className="text-gray-400 mb-8 leading-relaxed whitespace-pre-line">
                      {serv.description}
                    </p>
                  )}

                  {/* Información adicional */}
                  <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(serv.duration)}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ${serv.price}
                    </span>
                  </div>
                  
                  {/* Botón de reservar */}
                  <button 
                    onClick={() => handleReservar(serv)}
                    className="w-full bg-transparent text-[#e8c547] border-2 border-[#e8c547] px-6 py-4 font-bold uppercase tracking-widest hover:bg-[#e8c547] hover:text-black transition-all duration-500 flex items-center justify-center gap-3 text-sm"
                  >
                    Reservar
                    <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
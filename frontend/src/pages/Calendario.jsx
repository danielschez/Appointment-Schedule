// src/components/Calendario.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Calendario.css';

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const obtenerDiasDelMes = (año, mes) => {
  const fecha = new Date(año, mes, 1);
  const dias = [];
  while (fecha.getMonth() === mes) {
    dias.push(new Date(fecha));
    fecha.setDate(fecha.getDate() + 1);
  }
  return dias;
};

const timeStringToMinutes = (timeStr) => {
  const [horas, minutos, segundos = 0] = timeStr.split(':').map(Number);
  return horas * 60 + minutos;
};

const minutesToTimeString = (minutos) => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

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

const Calendario = () => {
  const navigate = useNavigate();
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [añoActual, setAñoActual] = useState(hoy.getFullYear());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formularioData, setFormularioData] = useState({
    name: '',
    email: '',
    phone: '',
    description: ''
  });
  const [enviandoCita, setEnviandoCita] = useState(false);

  const [servicios, setServicios] = useState([]);
  const [weekdays, setWeekdays] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [citas, setCitas] = useState([]);
  const [diasBloqueados, setDiasBloqueados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [breaks, setBreaks] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const servicioGuardado = sessionStorage.getItem('servicioSeleccionado');
    if (servicioGuardado) {
      try {
        const servicio = JSON.parse(servicioGuardado);
        setServicioSeleccionado(servicio);
      } catch (err) {
        console.error('Error al parsear servicio guardado:', err);
      }
    }

    const fetchAll = async () => {
      setCargando(true);
      setError(null);
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        
        console.log('🔗 Conectando a API:', apiUrl);
        
        const [srv, wd, wh, schedule, blocked, brks] = await Promise.all([
          axios.get(`${apiUrl}/service/`),
          axios.get(`${apiUrl}/weekday/`),
          axios.get(`${apiUrl}/workinghours/`),
          axios.get(`${apiUrl}/schedule/`),
          axios.get(`${apiUrl}/blocked-dates/`, { 
            params: { year: new Date().getFullYear() } 
          }).catch(err => {
            console.warn('⚠️ No se pudieron cargar días festivos:', err);
            return { data: { blocked_dates: [] } };
          }),
          axios.get(`${apiUrl}/breaks/`).catch(err => {
            console.warn('⚠️ No se pudieron cargar breaks:', err);
            return { data: [] };
          })
        ]);
        
        console.log('✅ Datos cargados exitosamente');
        console.log('📅 Días festivos bloqueados:', blocked.data.blocked_dates);
        
        setServicios(Array.isArray(srv.data) ? srv.data : []);
        setWeekdays(Array.isArray(wd.data) ? wd.data : []);
        setHorarios(Array.isArray(wh.data) ? wh.data : []);
        setCitas(Array.isArray(schedule.data) ? schedule.data : []);
        setDiasBloqueados(blocked.data.blocked_dates || []);
        setBreaks(Array.isArray(brks.data) ? brks.data : []);
        
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
        setError(`Error al cargar los datos: ${err.message}`);
        setServicios([]);
        setWeekdays([]);
        setHorarios([]);
        setCitas([]);
        setDiasBloqueados([]);
      } finally {
        setCargando(false);
      }
    };
    
    fetchAll();
  }, []);

  useEffect(() => {
    const fetchDiasBloqueados = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await axios.get(`${apiUrl}/blocked-dates/`, {
          params: { year: añoActual }
        });
        
        if (response.data.success) {
          setDiasBloqueados(response.data.blocked_dates);
          console.log(`📅 Días festivos actualizados para ${añoActual}:`, response.data.blocked_dates);
        }
      } catch (error) {
        console.warn('⚠️ Error al cargar días festivos:', error);
        setDiasBloqueados([]);
      }
    };

    if (!cargando) {
      fetchDiasBloqueados();
    }
  }, [añoActual, cargando]);

  const dias = obtenerDiasDelMes(añoActual, mesActual);

  const cambiarMes = (delta) => {
    let nuevoMes = mesActual + delta;
    let nuevoAño = añoActual;
    if (nuevoMes > 11) { nuevoMes = 0; nuevoAño += 1; }
    else if (nuevoMes < 0) { nuevoMes = 11; nuevoAño -= 1; }
    setMesActual(nuevoMes);
    setAñoActual(nuevoAño);
    setFechaSeleccionada(null);
  };

  const seleccionarFecha = (fecha) => {
    if (fecha < hoy) return;
    setFechaSeleccionada(fecha);
  };

  const volverAServicios = () => {
    sessionStorage.removeItem('servicioSeleccionado');
    navigate('/#servicios');
  };

  const seleccionarHora = (hora) => {
    setHoraSeleccionada(hora);
    setMostrarFormulario(true);
    setFormularioData(prev => ({
      ...prev,
      description: servicioSeleccionado?.name || ''
    }));
  };

  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    setFormularioData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const cerrarFormulario = () => {
    setHoraSeleccionada(null);
    setMostrarFormulario(false);
    setFormularioData({
      name: '',
      email: '',
      phone: '',
      description: ''
    });
  };

  // NUEVA FUNCIÓN: Recargar citas para actualizar disponibilidad
  const recargarCitas = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.get(`${apiUrl}/schedule/`);
      setCitas(Array.isArray(response.data) ? response.data : []);
      console.log('🔄 Citas recargadas');
    } catch (error) {
      console.error('Error al recargar citas:', error);
    }
  };

  const enviarCita = async (e) => {
    e.preventDefault();

    if (formularioData.company && formularioData.company.trim() !== "") {
      console.warn("Registro bloqueado por honeypot");
      return;
    }

    if (!formularioData.name || !formularioData.email || !formularioData.phone) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    if (!captchaToken) {
      alert("Por favor completa el reCAPTCHA.");
      return;
    }

    setEnviandoCita(true);

    try {
      const { company, description, tieneCodigo, promoCode, ...rest } = formularioData;

      const citaData = {
        ...rest,
        date: fechaSeleccionada.toISOString().split('T')[0],
        time: `${horaSeleccionada}:00`,
        description: description || servicioSeleccionado?.name || '',
        service: Number(servicioSeleccionado?.id),
        captchaToken
      };

      if (tieneCodigo === 'si' && promoCode && promoCode.trim()) {
        citaData.promo_code_text = promoCode.trim();
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.post(`${apiUrl}/schedule/`, citaData);

      console.log('✅ Cita creada:', response.data);
      
      if (captchaRef.current) {
        captchaRef.current.reset();
      }
      
      cerrarFormulario();
      alert('¡Cita agendada exitosamente!');
      
      sessionStorage.removeItem('servicioSeleccionado');
      navigate('/#servicios');

    } catch (error) {
      console.error('❌ Error al agendar cita:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        
        if (errorData.appointment_conflict) {
          alert(
            '⚠️ ' + errorData.appointment_conflict + '\n\n' +
            'El calendario se actualizará automáticamente.'
          );
          
          await recargarCitas();
          cerrarFormulario();
        }
        else if (errorData.date || errorData.time || errorData.non_field_errors) {
          alert(
            '⚠️ Este horario ya ha sido reservado.\n\n' +
            'Por favor, selecciona otro horario disponible.\n\n' +
            'El calendario se actualizará automáticamente.'
          );
          
          await recargarCitas();
          cerrarFormulario();
        }
        else if (errorData.promo_code) {
          alert(`❌ Código promocional: ${errorData.promo_code[0] || errorData.promo_code}`);
        }
        else if (errorData.detail) {
          alert(`❌ Error: ${errorData.detail}`);
        }
        else if (typeof errorData === 'object') {
          const mensajes = Object.entries(errorData)
            .map(([campo, errores]) => {
              const mensajesError = Array.isArray(errores) ? errores.join(', ') : errores;
              return `${campo}: ${mensajesError}`;
            })
            .join('\n');
          alert(`❌ Error de validación:\n${mensajes}`);
        }
        else {
          alert('❌ Error al agendar la cita. Por favor intente nuevamente.');
        }
      } else if (error.request) {
        alert('❌ Error de conexión. Por favor verifica tu conexión a internet e intenta nuevamente.');
      } else {
        alert('❌ Error inesperado. Por favor intente nuevamente.');
      }
      
      if (captchaRef.current) {
        captchaRef.current.reset();
        setCaptchaToken(null);
      }
      
    } finally {
      setEnviandoCita(false);
    }
  };

  const esFestivo = (fecha) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return diasBloqueados.some(dia => dia.date === fechaStr);
  };

  const getNombreFestivo = (fecha) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    const festivo = diasBloqueados.find(dia => dia.date === fechaStr);
    return festivo ? festivo.name : null;
  };

  const isInBreak = (horaStr) => {
    const slotMinutos = timeStringToMinutes(horaStr);
    return breaks.some(brk => {
      const inicio = timeStringToMinutes(brk.start_time);
      const fin = timeStringToMinutes(brk.end_time);
      return slotMinutos >= inicio && slotMinutos < fin;
    });
  };

  const getNombreBreak = (horaStr) => {
    const slotMinutos = timeStringToMinutes(horaStr);
    const brk = breaks.find(b => {
      const inicio = timeStringToMinutes(b.start_time);
      const fin = timeStringToMinutes(b.end_time);
      return slotMinutos >= inicio && slotMinutos < fin;
    });
    return brk ? brk.name : null;
  };

  const isDayBlocked = (fecha) => {
    const diaSemana = fecha.getDay();
    const dayMapping = {
      0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6
    };
    const weekdayId = dayMapping[diaSemana];
    const weekdayInfo = weekdays.find(w => w.id === weekdayId);
    return !weekdayInfo || !weekdayInfo.status;
  };

  const getCitasDelDia = (fecha) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return citas.filter(cita => cita.date === fechaStr);
  };

  const getServicioDuracion = (serviceId) => {
    const servicio = servicios.find(s => s.id === serviceId);
    if (!servicio || !servicio.duration) return 0;
    const parts = servicio.duration.split(':');
    const horas = parseInt(parts[0], 10);
    const minutos = parseInt(parts[1], 10);
    return horas * 60 + minutos;
  };

  const getEspaciosOcupados = (fecha) => {
    const citasDelDia = getCitasDelDia(fecha);
    const espaciosOcupados = [];
    citasDelDia.forEach(cita => {
      const inicio = timeStringToMinutes(cita.time);
      const fin = inicio + getServicioDuracion(cita.service);
      espaciosOcupados.push({ inicio, fin });
    });
    espaciosOcupados.sort((a, b) => a.inicio - b.fin);
    return espaciosOcupados;
  };

  const getEspaciosLibres = (fecha, horarioLaboral) => {
    const espaciosOcupados = getEspaciosOcupados(fecha);
    const espaciosLibres = [];
    const inicioLaboral = timeStringToMinutes(horarioLaboral.start_time);
    const finLaboral = timeStringToMinutes(horarioLaboral.end_time);

    if (espaciosOcupados.length === 0) {
      return [{ inicio: inicioLaboral, fin: finLaboral }];
    }

    if (espaciosOcupados[0].inicio > inicioLaboral) {
      espaciosLibres.push({
        inicio: inicioLaboral,
        fin: espaciosOcupados[0].inicio
      });
    }

    for (let i = 0; i < espaciosOcupados.length - 1; i++) {
      const finCitaActual = espaciosOcupados[i].fin;
      const inicioCitaSiguiente = espaciosOcupados[i + 1].inicio;
      if (inicioCitaSiguiente > finCitaActual) {
        espaciosLibres.push({
          inicio: finCitaActual,
          fin: inicioCitaSiguiente
        });
      }
    }

    const ultimaCita = espaciosOcupados[espaciosOcupados.length - 1];
    if (ultimaCita.fin < finLaboral) {
      espaciosLibres.push({
        inicio: ultimaCita.fin,
        fin: finLaboral
      });
    }

    return espaciosLibres;
  };

  const generarHorariosOptimizados = (espaciosLibres, duracionServicio) => {
    const horariosDisponibles = [];
    espaciosLibres.forEach(espacio => {
      const duracionEspacio = espacio.fin - espacio.inicio;
      if (duracionEspacio >= duracionServicio) {
        for (let minuto = espacio.inicio; 
             minuto <= espacio.fin - duracionServicio; 
             minuto += duracionServicio) {
          if (minuto + duracionServicio <= espacio.fin) {
            horariosDisponibles.push(minutesToTimeString(minuto));
          }
        }
      }
    });
    return horariosDisponibles;
  };

  const getHoraActualMexico = () => {
    const ahoraMexico = new Date().toLocaleString('en-US', {
      timeZone: 'America/Mexico_City'
    });
    
    const fechaMexico = new Date(ahoraMexico);
    return fechaMexico.getHours() * 60 + fechaMexico.getMinutes();
  };

  const horasDisponibles = () => {
    if (!fechaSeleccionada || !servicioSeleccionado) return [];
    
    const diaSemana = fechaSeleccionada.getDay();
    const dayMapping = {
      0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6
    };
    const dayId = dayMapping[diaSemana];
    const horarioDelDia = horarios.filter(h => h.day === dayId);

    if (horarioDelDia.length === 0) return [];

    const duracionMinutos = getServicioDuracion(servicioSeleccionado.id);
    let todosLosHorarios = [];

    horarioDelDia.forEach(horario => {
      const espaciosLibres = getEspaciosLibres(fechaSeleccionada, horario);
      const horariosDelPeriodo = generarHorariosOptimizados(espaciosLibres, duracionMinutos);
      todosLosHorarios = [...todosLosHorarios, ...horariosDelPeriodo];
    });

    const horariosUnicos = [...new Set(todosLosHorarios)];
    
    const hoyMexico = new Date().toLocaleString('en-US', {
      timeZone: 'America/Mexico_City'
    });
    const fechaHoyMexico = new Date(hoyMexico);
    fechaHoyMexico.setHours(0, 0, 0, 0);
    
    const fechaSeleccionadaSinHora = new Date(fechaSeleccionada);
    fechaSeleccionadaSinHora.setHours(0, 0, 0, 0);
    
    const esHoy = fechaSeleccionadaSinHora.getTime() === fechaHoyMexico.getTime();
    
    if (esHoy) {
      const horaActualMinutos = getHoraActualMexico();
      
      console.log('🕐 Hora actual en México:', minutesToTimeString(horaActualMinutos));
      
      return horariosUnicos
        .filter(hora => {
          const horaInicioMinutos = timeStringToMinutes(hora);
          return horaInicioMinutos >= horaActualMinutos;
        })
        .sort();
    }
    
    return horariosUnicos.sort();
  };

  const isDayAvailable = (fecha) => {
    const diaSemana = fecha.getDay();
    const dayMapping = {
      0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6
    };
    const dayId = dayMapping[diaSemana];
    const weekdayInfo = weekdays.find(w => w.id === dayId);
    const tieneHorarios = horarios.some(h => h.day === dayId);
    return weekdayInfo && weekdayInfo.status && tieneHorarios;
  };

  if (cargando) {
    return (
      <div className="calendario">
        <div className="cargando">
          <p>Cargando servicios y horarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendario">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  if (!servicioSeleccionado) {
    return (
      <div className="calendario">
        <div className="error">
          <p>No se ha seleccionado ningún servicio</p>
          <button onClick={volverAServicios}>
            Ir a Servicios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="calendario">
      <button onClick={volverAServicios} className="back-button">← Volver a servicios</button>

      <div className="header">
        <button onClick={() => cambiarMes(-1)}>◀</button>
        <h2>{new Date(añoActual, mesActual).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => cambiarMes(1)}>▶</button>
      </div>

      <div className="servicio-info">
        <p>
          <strong>{servicioSeleccionado.name}</strong> - 
          Duración: {formatDuration(servicioSeleccionado.duration)} - 
          Precio: ${servicioSeleccionado.price}
        </p>
      </div>

      <div className="dias-semana">
        {diasSemana.map(dia => <div key={dia} className="dia-semana">{dia}</div>)}
      </div>

      <div className="dias">
        {dias.length > 0 && Array(dias[0].getDay()).fill(null).map((_, i) =>
          <div key={i} className="dia vacio" />
        )}
        {dias.map(fecha => {
          const esPasado = fecha < hoy;
          const estaDisponible = isDayAvailable(fecha);
          const estaBloqueado = isDayBlocked(fecha);
          const esDiaFestivo = esFestivo(fecha);
          const nombreFestivo = getNombreFestivo(fecha);
          
          let claseCSS = 'dia';
          if (esPasado) {
            claseCSS += ' pasado';
          } else if (esDiaFestivo) {
            claseCSS += ' festivo';
          } else if (estaBloqueado) {
            claseCSS += ' bloqueado';
          } else if (estaDisponible) {
            claseCSS += ' disponible';
          } else {
            claseCSS += ' inactivo';
          }

          return (
            <div
              key={fecha.toDateString()}
              className={claseCSS}
              onClick={() => !esPasado && !estaBloqueado && !esDiaFestivo && estaDisponible && seleccionarFecha(fecha)}
              title={esDiaFestivo ? `🎉 ${nombreFestivo}` : ''}
            >
              {fecha.getDate()}
              {esDiaFestivo && <span className="festivo-icon">🎉</span>}
            </div>
          );
        })}
      </div>

      {fechaSeleccionada && (
        <div className="horas-disponibles">
          <h3>
            Horas disponibles para {fechaSeleccionada.toLocaleDateString()}<br />
            Servicio: <strong>{servicioSeleccionado.name}</strong> ({formatDuration(servicioSeleccionado.duration)})
          </h3>
          
          {getCitasDelDia(fechaSeleccionada).length > 0 && (
            <div className="citas-existentes">
              <h4>Citas ya programadas:</h4>
              <div className="citas-list">
                {getCitasDelDia(fechaSeleccionada).map(cita => {
                  const inicio = cita.time.slice(0, 5);
                  const duracion = getServicioDuracion(cita.service);
                  const fin = minutesToTimeString(timeStringToMinutes(cita.time) + duracion);
                  const servicioInfo = servicios.find(s => s.id === cita.service);
                  
                  return (
                    <div key={cita.id} className="cita-existente">
                      {inicio} - {fin} | {servicioInfo?.name || 'Servicio'}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="horas">
            {horasDisponibles().length > 0 ? (
              horasDisponibles().map(hora => {
                const inicio = hora;
                const duracion = timeStringToMinutes(servicioSeleccionado.duration);
                const fin = minutesToTimeString(timeStringToMinutes(hora) + duracion);
                const enBreak = isInBreak(hora);
                const nombreBreak = getNombreBreak(hora);

                return (
                  <button
                    key={hora}
                    className={`hora-disponible${enBreak ? ' hora-break' : ''}`}
                    onClick={() => !enBreak && seleccionarHora(hora)}
                    disabled={enBreak}
                    title={enBreak ? `🚫 ${nombreBreak}` : `Reservar ${inicio} - ${fin}`}
                  >
                    <div className="hora-inicio">{inicio}</div>
                    <div className="hora-fin">{enBreak ? `🚫 ${nombreBreak}` : `a ${fin}`}</div>
                  </button>
                );
              })
            ) : (
              <p>No hay horas disponibles este día.</p>
            )}
          </div>
        </div>
      )}

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Agendar Cita</h3>
              <button className="close-button" onClick={cerrarFormulario}>✕</button>
            </div>
            
            <div className="cita-info">
              <p><strong>Servicio:</strong> {servicioSeleccionado.name}</p>
              <p><strong>Fecha:</strong> {fechaSeleccionada.toLocaleDateString()}</p>
              <p><strong>Hora:</strong> {horaSeleccionada} - {minutesToTimeString(timeStringToMinutes(horaSeleccionada) + getServicioDuracion(servicioSeleccionado.id))}</p>
              <p><strong>Precio:</strong> ${servicioSeleccionado.price}</p>
            </div>

            <form onSubmit={enviarCita} className="formulario-cita">

              <div style={{ display: 'none' }}>
                <label htmlFor="company">Empresa</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formularioData.company || ''}
                  onChange={manejarCambioFormulario}
                  autoComplete="off"
                />
              </div>

              <div className="campo">
                <label htmlFor="name">Nombre completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formularioData.name}
                  onChange={manejarCambioFormulario}
                  required
                  placeholder="Ingrese su nombre completo"
                  pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{5,}$" 
                  title="Debe contener al menos 5 letras y solo caracteres válidos"
                />
              </div>

              <div className="campo">
                <label htmlFor="email">Correo electrónico *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formularioData.email}
                  onChange={manejarCambioFormulario}
                  required
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div className="campo">
                <label htmlFor="phone">Teléfono *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formularioData.phone}
                  onChange={manejarCambioFormulario}
                  required
                  placeholder="Número de teléfono"
                  pattern="^[0-9]{7,15}$" 
                  title="Debe ser un número válido"
                />
              </div>

              <div className="mb-6">
                <p className="text-gray-700 font-medium mb-2">
                  ¿Tienes un código promocional de descuento?
                </p>

                <div className="flex items-center gap-4 mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tieneCodigo"
                      value="si"
                      checked={formularioData.tieneCodigo === 'si'}
                      onChange={manejarCambioFormulario}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">Sí</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tieneCodigo"
                      value="no"
                      checked={formularioData.tieneCodigo === 'no'}
                      onChange={manejarCambioFormulario}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>

                {formularioData.tieneCodigo === 'si' && (
                  <div className="animate-fadeIn">
                    <label
                      htmlFor="promoCode"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Ingresa tu código promocional
                    </label>
                    <input
                      type="text"
                      id="promoCode"
                      name="promoCode"
                      value={formularioData.promoCode}
                      onChange={manejarCambioFormulario}
                      placeholder="Ej: DESCUENTO10"
                      pattern="^[A-Za-z0-9]{4,15}$"
                      title="El código debe tener entre 4 y 10 caracteres alfanuméricos"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-black"
                    />
                  </div>
                )}
              </div>

              <div className="campo">
                <label htmlFor="description">Descripción (opcional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formularioData.description}
                  onChange={manejarCambioFormulario}
                  rows="3"
                  placeholder="Detalles adicionales sobre el servicio"
                />
              </div>

              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                ref={captchaRef}
                theme="light"
                size="normal"
              />

              <div className="botones-formulario">
                <button 
                  type="button" 
                  className="boton-cancelar"
                  onClick={cerrarFormulario}
                  disabled={enviandoCita}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="boton-confirmar"
                  disabled={enviandoCita}
                >
                  {enviandoCita ? 'Agendando...' : 'Confirmar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario;
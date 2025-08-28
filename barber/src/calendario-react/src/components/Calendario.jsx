// src/components/Calendario.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  // durationStr viene como "00:01:00" para 1 hora, "00:00:30" para 30 min, etc.
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

  const API_BASE = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [srv, wd, wh, schedule] = await Promise.all([
          axios.get(`${API_BASE}/service/`),
          axios.get(`${API_BASE}/weekday/`),
          axios.get(`${API_BASE}/workinghours/`),
          axios.get(`${API_BASE}/schedule/`)
        ]);
        setServicios(srv.data);
        setWeekdays(wd.data);
        setHorarios(wh.data);
        setCitas(schedule.data);
      } catch (err) {
        console.error('Error cargando datos:', err);
      }
    };
    fetchAll();
  }, []);

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

  const resetear = () => {
    setServicioSeleccionado(null);
    setFechaSeleccionada(null);
    setHoraSeleccionada(null);
    setMostrarFormulario(false);
    setFormularioData({
      name: '',
      email: '',
      phone: '',
      description: ''
    });
  };

  const seleccionarHora = (hora) => {
    setHoraSeleccionada(hora);
    setMostrarFormulario(true);
    // Prellenar la descripción con el nombre del servicio
    setFormularioData(prev => ({
      ...prev,
      description: servicioSeleccionado.name
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

  const enviarCita = async (e) => {
    e.preventDefault();
    
    if (!formularioData.name || !formularioData.email || !formularioData.phone) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    setEnviandoCita(true);

    try {
      const citaData = {
        date: fechaSeleccionada.toISOString().split('T')[0], // YYYY-MM-DD
        time: `${horaSeleccionada}:00`, // HH:MM:SS
        name: formularioData.name,
        email: formularioData.email,
        phone: formularioData.phone,
        description: formularioData.description || servicioSeleccionado.name,
        service: servicioSeleccionado.id
      };

      console.log('Enviando cita:', citaData);

      const response = await axios.post(`${API_BASE}/schedule/`, citaData);
      
      console.log('Cita creada:', response.data);
      
      // Actualizar la lista de citas
      const citasActualizadas = await axios.get(`${API_BASE}/schedule/`);
      setCitas(citasActualizadas.data);
      
      // Limpiar formulario y cerrar
      cerrarFormulario();
      
      alert('¡Cita agendada exitosamente!');
      
    } catch (error) {
      console.error('Error al agendar cita:', error);
      alert('Error al agendar la cita. Por favor intente nuevamente.');
    } finally {
      setEnviandoCita(false);
    }
  };

  const isDayBlocked = (fecha) => {
    const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    // Mapeo de getDay() a los IDs de weekday de tu API
    const dayMapping = {
      0: 7, // Domingo
      1: 1, // Lunes
      2: 2, // Martes
      3: 3, // Miércoles
      4: 4, // Jueves
      5: 5, // Viernes
      6: 6  // Sábado
    };
    
    const weekdayId = dayMapping[diaSemana];
    const weekdayInfo = weekdays.find(w => w.id === weekdayId);
    
    return !weekdayInfo || !weekdayInfo.status;
  };

  const getCitasDelDia = (fecha) => {
    const fechaStr = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
    return citas.filter(cita => cita.date === fechaStr);
  };

  const getServicioDuracion = (serviceId) => {
    const servicio = servicios.find(s => s.id === serviceId);
    if (!servicio) return 0;
    
    // Parse duration "00:01:00" -> 60 minutos, "00:00:30" -> 30 minutos
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

    // Ordenar por hora de inicio
    espaciosOcupados.sort((a, b) => a.inicio - b.fin);
    return espaciosOcupados;
  };

  const getEspaciosLibres = (fecha, horarioLaboral) => {
    const espaciosOcupados = getEspaciosOcupados(fecha);
    const espaciosLibres = [];
    
    const inicioLaboral = timeStringToMinutes(horarioLaboral.start_time);
    const finLaboral = timeStringToMinutes(horarioLaboral.end_time);

    if (espaciosOcupados.length === 0) {
      // No hay citas, todo el horario laboral está libre
      return [{ inicio: inicioLaboral, fin: finLaboral }];
    }

    // Verificar espacio antes de la primera cita
    if (espaciosOcupados[0].inicio > inicioLaboral) {
      espaciosLibres.push({
        inicio: inicioLaboral,
        fin: espaciosOcupados[0].inicio
      });
    }

    // Verificar espacios entre citas
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

    // Verificar espacio después de la última cita
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
        // Generar intervalos usando la duración exacta del servicio
        for (let minuto = espacio.inicio; 
             minuto <= espacio.fin - duracionServicio; 
             minuto += duracionServicio) {
          
          // Verificar que la cita termine antes del final del espacio
          if (minuto + duracionServicio <= espacio.fin) {
            horariosDisponibles.push(minutesToTimeString(minuto));
          }
        }
      }
    });

    return horariosDisponibles;
  };

  const horasDisponibles = () => {
    if (!fechaSeleccionada || !servicioSeleccionado) return [];

    const diaSemana = fechaSeleccionada.getDay();
    
    const dayMapping = {
      0: 7, // Domingo
      1: 1, // Lunes
      2: 2, // Martes
      3: 3, // Miércoles
      4: 4, // Jueves
      5: 5, // Viernes
      6: 6  // Sábado
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

    // Eliminar duplicados y ordenar
    const horariosUnicos = [...new Set(todosLosHorarios)];
    return horariosUnicos.sort();
  };

  const isDayAvailable = (fecha) => {
    const diaSemana = fecha.getDay();
    
    const dayMapping = {
      0: 7, // Domingo
      1: 1, // Lunes
      2: 2, // Martes
      3: 3, // Miércoles
      4: 4, // Jueves
      5: 5, // Viernes
      6: 6  // Sábado
    };
    
    const dayId = dayMapping[diaSemana];
    const weekdayInfo = weekdays.find(w => w.id === dayId);
    const tieneHorarios = horarios.some(h => h.day === dayId);
    
    return weekdayInfo && weekdayInfo.status && tieneHorarios;
  };

  return (
    <div className="calendario">
      {!servicioSeleccionado ? (
        <div className="selector-servicio">
          <h2>Seleccione un tipo de servicio</h2>
          {servicios.length === 0 && <p>Cargando servicios...</p>}
          {servicios.map(serv => (
            <button
              key={serv.id}
              onClick={() => setServicioSeleccionado(serv)}
              className="boton-servicio"
            >
              <div>
                <strong>{serv.name}</strong>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  Duración: {formatDuration(serv.duration)} | Precio: ${serv.price}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          <button onClick={resetear}>← Cambiar servicio</button>

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
              
              let claseCSS = 'dia';
              if (esPasado) {
                claseCSS += ' pasado';
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
                  onClick={() => !esPasado && !estaBloqueado && estaDisponible && seleccionarFecha(fecha)}
                >
                  {fecha.getDate()}
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
              
              {/* Mostrar citas existentes para referencia */}
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
                          {inicio} - {fin} | {servicioInfo?.name || 'Servicio'} | {cita.name}
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
                    
                    return (
                      <button 
                        key={hora} 
                        className="hora-disponible"
                        onClick={() => seleccionarHora(hora)}
                      >
                        <div className="hora-inicio">{inicio}</div>
                        <div className="hora-fin">a {fin}</div>
                      </button>
                    );
                  })
                ) : (
                  <p>No hay horas disponibles este día.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal del formulario */}
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
                />
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
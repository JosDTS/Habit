// Devuelve la fecha en formato "YYYY-MM-DD" usando el DIA LOCAL del dispositivo,
// no el dia UTC. `toISOString()` siempre da la fecha en UTC, lo cual en Costa Rica
// (UTC-6) hace que cualquier accion hecha entre las 6pm y la medianoche locales
// quede guardada con la fecha del dia SIGUIENTE, rompiendo rachas y estadisticas.
export function fechaLocalTexto(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

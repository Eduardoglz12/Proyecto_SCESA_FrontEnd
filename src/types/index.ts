export interface Alumno {
  numeroControl: string;
  nombreCompleto: string;
  grado: number;
  grupo: string;
  turno: string;
  nombreTutor: string;
  emailTutor: string;
}

export interface AsistenciaBackend {
  id: number;
  numeroControl: string;
  nombre: string;
  grado: number;
  grupo: string;
  turno: string;
  evento: string;
  fecha: string;
  operador: number;
}

export interface Registro {
  id: string;
  alumno: string;
  nombre: string;
  grado?: number;
  grupo: string;
  turno: string;
  tipo: 'Entrada' | 'Salida';
  hora: string;
  fecha: string;
}

export interface User {
  id?: number;
  username: string;
  nombre?: string;
  role: 'admin' | 'operator';
  password?: string; // Solo para creación/edición
}

export type EstadoCita = "Pendiente" | "Confirmada" | "Cancelada";

export type CitaPortal = {
  idCita: number;
  motivo: string | null;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
  fechaHora: string;
  estado: EstadoCita;
};

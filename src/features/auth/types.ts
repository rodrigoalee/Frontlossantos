export type LoginState = {
  error?: string;
  correo?: string;
} | undefined;

export type UsuarioSesion = {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  /** Falso en una cuenta de Google que aún no entrega su teléfono. */
  perfilCompleto: boolean;
};

/** Respuesta de POST /api/auth/login en CustomCore.API */
export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiraEn: string;
  usuario: UsuarioSesion;
};

export type LoginState = {
  error?: string;
  correo?: string;
} | undefined;

export type RegistroState = {
  error?: string;
  valores?: { nombreCompleto: string; correo: string; telefono: string };
} | undefined;

export type CompletarPerfilState = {
  error?: string;
  telefono?: string;
} | undefined;

export type UsuarioSesion = {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  perfilCompleto: boolean;
  permisos?: string[] | null;
};

/** Respuesta de POST /api/auth/login en CustomCore.API */
export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiraEn: string;
  usuario: UsuarioSesion;
};

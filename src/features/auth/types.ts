export type LoginState = {
  error?: string;
  username?: string;
} | undefined;

export type LoginResponse = {
  token: string;
};

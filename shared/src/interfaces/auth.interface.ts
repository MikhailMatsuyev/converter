export interface IAuthResponse {
  user: IAuthUser;  // Используем IAuthUser
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface IAuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface DecodedToken {
  success: boolean;
  id: string;
  user: string;
  role: string;
  iat: number;
  exp: number;
}

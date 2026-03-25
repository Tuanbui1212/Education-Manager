export interface DecodedToken {
  id: string;
  email: string;
  name: string;
  success: boolean;
  user: string;
  phone: string;
  role: {
    _id: string;
    name: string;
    description: string;
    permissions: string[];
  };
  iat: number;
  exp: number;
}

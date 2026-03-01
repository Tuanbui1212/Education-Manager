import { DecodedToken } from './user.type';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

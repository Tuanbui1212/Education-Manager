import { DecodedToken } from "./user.type"; // Import cái interface DecodedToken của bạn

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

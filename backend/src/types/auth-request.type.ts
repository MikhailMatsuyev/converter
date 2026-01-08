import { auth } from "firebase-admin";
import DecodedIdToken = auth.DecodedIdToken;
import { Request } from 'express';

export interface AuthRequest extends Request {
    user: DecodedIdToken;
}

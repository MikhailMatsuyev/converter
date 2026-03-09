import { auth } from "firebase-admin";
import DecodedIdToken = auth.DecodedIdToken;
import { Request } from 'express';
import { IUser } from "@shared/interfaces";

export interface AuthRequest extends Request {
    user: DecodedIdToken;
}

export interface AuthenticatedRequest extends Request {
    user: IUser;
}

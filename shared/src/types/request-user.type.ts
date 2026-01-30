import { UserType } from "../enums";
import { IUser } from "../interfaces";

export type RequestUser =
  | {
  isAuthenticated: false;
  type: UserType.GUEST;
  isPaid: false;
  guestId: string; // уникальный идентификатор для лимитов guestId: req.headers["x-guest-id"] || generateUUID(),
}
  | {
  isAuthenticated: true;
  firebaseUid : string;
  type: UserType.USER | UserType.ADMIN;
  isPaid: boolean;
};

export type FileUser = IUser & { isPaid: boolean };


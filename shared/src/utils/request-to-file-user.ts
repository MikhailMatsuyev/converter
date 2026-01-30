import { UserType } from '../enums';
import { FileUser, RequestUser } from "../types";

export function toFileUser(user: RequestUser): FileUser {
  if (user.isAuthenticated) {
    return {
      id: user.firebaseUid ,
      firebaseUid : user.firebaseUid ,
      email: '',          // при необходимости заполнить
      displayName: null,
      photoURL: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      storageQuota: 0,
      usedStorage: 0,
      type: user.type,
      isPaid: user.isPaid,
    };
  } else {
    const guestId = user.guestId;
    return {
      id: 'guest-' + guestId,
      firebaseUid : guestId,
      email: '',
      displayName: null,
      photoURL: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      storageQuota: 0,
      usedStorage: 0,
      type: UserType.GUEST,
      isPaid: false,
    };
  }
}

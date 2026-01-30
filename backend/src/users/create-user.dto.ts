export class CreateUserDto {
  firebaseUid !: string;
  email?: string;
  displayName?: string | null;
  photoURL?: string | null;
}

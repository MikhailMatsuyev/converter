export class CreateUserDto {
  uid!: string;
  email?: string;
  displayName?: string | null;
  photoURL?: string | null;
}

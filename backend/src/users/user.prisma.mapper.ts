import { Prisma } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';

export function mapToPrismaCreateInput(
  dto: CreateUserDto,
): Prisma.UserCreateInput {
  if (!dto.firebaseUid ) {
    throw new Error('firebaseUid  is required');
  }

  if (!dto.email) {
    throw new Error('email is required');
  }

  return {
    firebaseUid : dto.firebaseUid ,
    email: dto.email,
    displayName: dto.displayName ?? null,
    photoURL: dto.photoURL ?? null,
  };
}

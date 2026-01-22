import { Prisma } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';

export function mapToPrismaCreateInput(
  dto: CreateUserDto,
): Prisma.UserCreateInput {
  if (!dto.uid) {
    throw new Error('uid is required');
  }

  if (!dto.email) {
    throw new Error('email is required');
  }

  return {
    uid: dto.uid,
    email: dto.email,
    displayName: dto.displayName ?? null,
    photoURL: dto.photoURL ?? null,
  };
}

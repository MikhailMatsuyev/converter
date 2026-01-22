import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { prisma } from './prisma.config';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from "rxjs/operators";
import { PrismaClient } from "@prisma/client";
import { Prisma } from '@prisma/client';
type User = Prisma.UserGetPayload<{}>;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    /*const adapter = new PrismaPgAdapter({
      connectionString: process.env.DATABASE_URL!,
    });
    super({ adapter }); // Prisma 7 принимает adapter*/
    super();
  }

  // public client = prisma;

  onModuleInit(): Observable<unknown> {
    return from(this.$connect());
  }

  onModuleDestroy(): Observable<unknown> {
    return from(this.$disconnect());
  }

  findUserByUid(uid: string): Observable<User | null> {
    return from(this.user.findUnique({ where: { uid } }));
  }

  createUser(data: Prisma.UserCreateInput): Observable<User> {
    return from(this.user.create({ data }));
  }

  findAllUsers(): Observable<User[]> {
    return from(this.user.findMany());
  }

  updateUser(id: string, data: Partial<User>): Observable<User | null> {
    return from(this.user.update({ where: { id }, data })).pipe(
      // В случае ошибки возвращаем null
      catchError(() => of(null)),
    );
  }

  deleteUser(id: string): Observable<boolean> {
    return from(this.user.delete({ where: { id } })).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { from, Observable, switchMap, map, finalize } from 'rxjs';
import { UsersService } from "../users/users.service";

@Injectable()
export class AppleService {
  constructor(private readonly usersService: UsersService) {}

  applyPaidStatus(
    firebaseUid: string,
    isPaid: boolean,
    reason?: string,
  ): Observable<{ firebaseUid: string; isPaid: boolean }> {
    return from(this.usersService.findByFirebaseUid(firebaseUid)).pipe(
      switchMap((user) => {
        if (!user) throw new NotFoundException('User not found');

        // полностью реактивное обновление
        return this.usersService.setPaid(user.id, isPaid).pipe(
          map(() => {
            console.log(
              `[MOCK S2S] ${firebaseUid} -> isPaid=${isPaid} (${reason || 'manual'})`,
            );
            return { firebaseUid, isPaid };
          }),
          finalize(() => console.log('Observable completed')), // убедимся, что завершение есть
        );
      }),
    );
  }
}

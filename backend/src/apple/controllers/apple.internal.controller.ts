import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SetPaidDto } from "../dto/set-paid.dto";
import { InternalSecretGuard } from "../guards/internal-secret.guard";
import { AppleService } from "../apple.service";

@Controller('internal/apple')
@UseGuards(InternalSecretGuard)
export class AppleInternalController {
  constructor(private readonly appleService: AppleService) {}

  @Post('set-paid')
  setPaid(@Body() dto: SetPaidDto): Observable<{ firebaseUid: string; isPaid: boolean }> {
    return this.appleService.applyPaidStatus(dto.firebaseUid, dto.isPaid, dto.reason);
  }
}

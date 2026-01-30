import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class InternalSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    console.log("=============process.env.INTERNAL_API_SECRET==========", process.env.INTERNAL_API_SECRET)
    return request.headers['x-internal-secret'] === process.env.INTERNAL_API_SECRET;
  }
}

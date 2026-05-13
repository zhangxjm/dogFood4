import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "../schemas/user.schema";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.split(" ")[1];
    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;

      const roles = this.reflector.get<UserRole[]>(
        "roles",
        context.getHandler(),
      );
      if (roles && !roles.includes(payload.role)) {
        throw new ForbiddenException("权限不足");
      }

      return true;
    } catch {
      return false;
    }
  }
}

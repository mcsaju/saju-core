import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/decorators/role.decorator';
import { UserRequest } from 'src/interfaces/user_request.interface';
import { Config } from 'src/schemas/config.schema';
import { Role, RoleEnum, roleSchema } from 'src/schemas/role.schema';
import { TokenPayload, tokenPayloadSchema } from 'src/schemas/token.schema';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Config, true>,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<UserRequest>();

    const requiredRoles = this.reflector.get<Role[]>(
      Roles,
      context.getHandler(),
    );
    // If there are no required roles, then the route is public
    if (!requiredRoles) {
      return true;
    }
    // If required roles include GUEST, then the route is public
    if (requiredRoles.includes(RoleEnum.GUEST)) {
      return true;
    }

    const headerKey = this.config.get<Config['auth']>('auth').gatewayJwtHeader;
    const token = request.headers[headerKey]?.toString();
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const secret = this.config.get<Config['auth']>('auth').gatewayJwtSecret;

    const verifiedToken = await this.jwtService
      .verifyAsync<TokenPayload>(token, {
        secret,
      })
      .catch(() => {
        throw new UnauthorizedException('Invalid token');
      });

    const parsedTokenPayload = await tokenPayloadSchema.safeParseAsync({
      uuid: verifiedToken.uuid,
      role: verifiedToken.role.toLowerCase(),
    });

    if (!parsedTokenPayload.success) {
      throw new UnauthorizedException('Invalid token payload');
    }
    // Validate the Role
    const isValidRole = requiredRoles.some(
      (requiredRole) => requiredRole === parsedTokenPayload.data.role,
    );
    if (!isValidRole) {
      return false;
    }

    // Set the user object to the request object
    request.user = {
      uuid: parsedTokenPayload.data.uuid,
      role: parsedTokenPayload.data.role,
    };
    return true;
  }
}

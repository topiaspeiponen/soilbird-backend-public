import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    // You can throw an exception based on either "info" or "err" arguments
    if (!user) {
      throw new UnauthorizedException();
    }

    // Get endpoint metadata for required token type
    const tokens = this.reflector.get<string[]>('token', context.getHandler());
    // If metadata is controller wide, use getClass()
    const tokensController = this.reflector.get<string[]>(
      'token',
      context.getClass(),
    );
    console.log('jwt guard tokens ', tokens, tokensController, user);
    if (!tokens && !tokensController) {
      return false;
    }

    // Check if endpoint token type requirement matches used token's type
    if (tokens && tokens[0] !== user.token_type) {
      throw new UnauthorizedException('Invalid token')
    } else if (tokensController && tokensController[0] !== user.token_type) {
      throw new UnauthorizedException('Invalid token')
    }
    console.log('JWT AUTH GUARD', info, err, user, tokens);

    

    return user;
  }
}

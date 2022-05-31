import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { CredentialLevel } from './credential.level';

@Injectable()
export class UsersGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('Users guard')
    // Get endpoint metadata for required user access level
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    // If metadata is controller wide, use getClass()
    const rolesController = this.reflector.get<string[]>('roles', context.getClass());
    if (!roles && !rolesController) {
      return false;
    }

    // Get the request that is being handled and extract user
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const credentialLevelUser = CredentialLevel[user.credential_level]
    const credentialLevelGuard = roles ? CredentialLevel[roles[0]] : CredentialLevel[rolesController[0]]
    if (credentialLevelUser !== null && credentialLevelGuard !== null) {
      console.log('Users guard ', roles, user)
      if (credentialLevelUser >= credentialLevelGuard) {
        return true
      }
      return false
    }
    return false
  }
}

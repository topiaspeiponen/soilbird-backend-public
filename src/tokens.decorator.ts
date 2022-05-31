import { SetMetadata } from '@nestjs/common';

/** Type of JWT token required to access an endpoint. Token type is included in JWT payload. See CredentialLevel enum included in credential.level.ts file
 *  for a list of current token types
 * 
 */
export const Tokens = (...tokens: string[]) => SetMetadata('token', tokens);

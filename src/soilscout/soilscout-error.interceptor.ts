import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable()
export class SoilscoutErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(catchError(err => {
      console.log('Interceptor error ', err)
      if (err.status && err.status === 401) {
        const newError = err;
        newError.response = 'Invalid token'
        newError.message = 'Invalid token'
        return throwError(newError)
      }
      return throwError(err)
    }))
  }
}

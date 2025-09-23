import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Messages } from '../constants/messages.constants';

export interface Response<T> {
  success: boolean;
  message: {
    text: string;
    type: string;
  };
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          data.success !== undefined &&
          data.message !== undefined &&
          data.data !== undefined
        ) {
          return data;
        }

        return {
          success: true,
          message: {
            text: Messages.GENERAL.SUCCESS,
            type: 'success',
          },
          data,
        };
      }),
    );
  }
}

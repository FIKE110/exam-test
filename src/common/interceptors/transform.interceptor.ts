import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface Response<T> {
  status: boolean;
  data: T;
  error: null;
  meta: {
    timestamp: string;
    request_id: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const requestId = uuidv4();

    return next.handle().pipe(
      map((data) => {
        // Check if data already has our structure (for custom responses)
        if (data && typeof data === 'object' && 'status' in data) {
          return {
            ...data,
            meta: {
              timestamp: new Date().toISOString(),
              request_id: requestId,
              ...data.meta,
            },
          };
        }

        // Extract pagination if present
        let responseData = data;
        let pagination:
          | { page: number; limit: number; total: number; total_pages: number }
          | undefined = undefined;

        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'pagination' in data
        ) {
          responseData = data.data;
          pagination = data.pagination;
        }

        const meta: any = {
          timestamp: new Date().toISOString(),
          request_id: requestId,
        };

        if (pagination) {
          meta.pagination = pagination;
        }

        return {
          status: true,
          data: responseData,
          error: null,
          meta,
        };
      }),
    );
  }
}

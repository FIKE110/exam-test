import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface ErrorResponse {
  status: boolean;
  data: null;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
  meta: {
    timestamp: string;
    request_id: string;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = uuidv4();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: Array<{ field?: string; message: string }> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const errorObj = exceptionResponse as any;

        // Handle our custom validation format: { message: string, errors: [{field, message}] }
        if (errorObj.errors && Array.isArray(errorObj.errors)) {
          details = errorObj.errors;
          message = errorObj.message || 'Validation failed';
          errorCode = 'VALIDATION_ERROR';
        }
        // Handle NestJS default validation format: { message: string[] }
        else if (errorObj.message && Array.isArray(errorObj.message)) {
          details = errorObj.message.map((msg: string) => ({ message: msg }));
          message = 'Validation failed';
          errorCode = 'VALIDATION_ERROR';
        } else {
          message = errorObj.message || message;
          if (errorObj.error) {
            errorCode = this.mapHttpStatusToErrorCode(status);
          }
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Map HTTP status to error code if not already set
    if (errorCode === 'INTERNAL_SERVER_ERROR') {
      errorCode = this.mapHttpStatusToErrorCode(status);
    }

    const errorResponse: ErrorResponse = {
      status: false,
      data: null,
      error: {
        code: errorCode,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: requestId,
      },
    };

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Exception:', exception);
    }

    response.status(status).json(errorResponse);
  }

  private mapHttpStatusToErrorCode(status: number): string {
    const statusCodes: { [key: number]: string } = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return statusCodes[status] || 'UNKNOWN_ERROR';
  }
}

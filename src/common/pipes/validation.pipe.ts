import { ValidationPipe as NestValidationPipe, ValidationError } from '@nestjs/common';

export const validationPipeConfig = new NestValidationPipe({
  whitelist: true, // Strip properties that don't have decorators
  forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
  transform: true, // Transform payloads to DTO instances
  transformOptions: {
    enableImplicitConversion: true,
  },
  exceptionFactory: (errors: ValidationError[]) => {
    const formatErrors = (errors: ValidationError[]): Array<{ field: string; message: string }> => {
      const result: Array<{ field: string; message: string }> = [];
      
      for (const error of errors) {
        if (error.constraints) {
          result.push({
            field: error.property,
            message: Object.values(error.constraints)[0],
          });
        }
        
        if (error.children && error.children.length > 0) {
          result.push(...formatErrors(error.children));
        }
      }
      
      return result;
    };

    return {
      message: 'Validation failed',
      errors: formatErrors(errors),
    };
  },
});

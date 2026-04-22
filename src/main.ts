import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { validationPipeConfig } from './common/pipes/validation.pipe';
import { apiReference } from '@scalar/nestjs-api-reference';
import * as express from 'express';

// Create Express instance
const server = express();

// Bootstrap function
async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  const parsedOrigin =
    corsOrigin === '*' ? '*' : corsOrigin.split(',').map((o) => o.trim());

  app.enableCors({
    origin: '*', // Allow any domain
    methods: '*', // Allow any HTTP method (GET, POST, etc.)
    allowedHeaders: '*', // Allow any request headers
  });
  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(validationPipeConfig);

  // Generate OpenAPI document
  const config = new DocumentBuilder()
    .setTitle('Exam Preparation Platform API')
    .setDescription(
      'API for exam preparation platform with AI study assistance, practice tests, and progress tracking',
    )
    .setVersion('1.0.0')
    .addTag('Health', 'Health check endpoints')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User profile and account management')
    .addTag('Courses', 'Exam courses and enrollment')
    .addApiKey({ type: 'apiKey', name: 'api_key', in: 'header' }, 'api_key')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Add components/schemas for DTOs
  document.components = document.components || {};
  document.components.schemas = document.components.schemas || {};

  // Serve OpenAPI JSON
  server.use('/api/docs-json', (req, res) => {
    res.json(document);
  });

  // Scalar API documentation
  server.use(
    '/api/docs',
    apiReference({
      theme: 'purple',
      spec: {
        url: '/api/docs-json',
      },
    }),
  );

  await app.init();

  return app;
}

// For Vercel serverless
let cachedApp: any = null;

async function getApp() {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return cachedApp;
}

// Vercel serverless handler
export default async function handler(req: any, res: any) {
  await getApp();
  server(req, res);
}

// For local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const port = process.env.PORT || 3001;
  bootstrap().then(() => {
    server.listen(port, () => {
      console.log(`Application is running on: http://localhost:${port}/api`);
      console.log(`API docs available at: http://localhost:${port}/api/docs`);
    });
  });
}

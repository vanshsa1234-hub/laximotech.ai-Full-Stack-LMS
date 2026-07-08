import { NestFactory }    from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // This is a live data API — every response should reflect the current DB
  // state. Express auto-generates an ETag for every response by default,
  // which makes browsers send conditional GETs and can get served a stale
  // 304 (e.g. the activity heatmap silently going blank right after new
  // completions, because the browser trusted an old cached copy). Disabling
  // both removes that whole class of bug. Scoped to /api so uploaded images
  // under /uploads can still be cached normally for performance.
  app.set('etag', false);
  app.use(
  '/api',
  (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', 'no-store');
    next();
  },
);

  // Locally-stored uploads (thumbnails, blog covers, career-path icons) —
  // served directly, no AWS account required. Not affected by the
  // 'api/v1' prefix below since this is plain static middleware.
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  app.use(helmet({
    // Without this, <img> tags on the Next.js frontend (different port)
    // get silently blocked from loading images served by this API.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
      'https://laximotech.ai',
      'https://www.laximotech.ai',
    ],
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  if (process.env.NODE_ENV !== 'production') {
    const cfg = new DocumentBuilder()
      .setTitle('laximotech.ai API')
      .setDescription('LMS Backend API v2 — Auth, Courses, Payments, AI, Code Playground')
      .setVersion('2.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .addTag('Auth').addTag('Courses').addTag('Enrollments').addTag('Orders')
      .addTag('Lessons').addTag('Progress').addTag('Quizzes').addTag('Certificates')
      .addTag('Blog').addTag('Career Paths').addTag('Comments').addTag('AI')
      .addTag('Code').addTag('Users').addTag('Admin').addTag('Storage')
      .build();
    const doc = SwaggerModule.createDocument(app, cfg);
    SwaggerModule.setup('api/docs', app, doc, { swaggerOptions: { persistAuthorization: true } });
    console.log(`📚 Swagger: http://localhost:${process.env.PORT ?? 4000}/api/docs`);
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 laximotech.ai API → http://localhost:${port}/api/v1`);
}
bootstrap();

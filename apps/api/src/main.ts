import { NestFactory }    from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
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

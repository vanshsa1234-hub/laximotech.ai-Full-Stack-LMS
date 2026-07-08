import { Module }            from '@nestjs/common';
import { APP_GUARD }         from '@nestjs/core';
import { ConfigModule }      from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule }      from './prisma/prisma.module';
import { AuthModule }        from './auth/auth.module';
import { CoursesModule }     from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { OrdersModule }      from './orders/orders.module';
import { LessonsModule }     from './lessons/lessons.module';
import { ProgressModule }    from './progress/progress.module';
import { UsersModule }       from './users/users.module';
import { StorageModule }     from './storage/storage.module';
import { HealthModule }      from './health/health.module';
import { QuizzesModule }     from './quizzes/quizzes.module';
import { CertificatesModule }from './certificates/certificates.module';
import { BlogModule }        from './blog/blog.module';
import { CareerPathsModule } from './career-paths/career-paths.module';
import { CommentsModule }    from './comments/comments.module';
import { AiModule }          from './ai/ai.module';
import { AdminModule }       from './admin/admin.module';
import { DemoRequestsModule } from './demo-requests/demo-requests.module';
import { SiteContentModule }  from './site-content/site-content.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { ReviewsModule } from './reviews/reviews.module';
import { InstructorsModule } from './instructors/instructors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    OrdersModule,
    LessonsModule,
    ProgressModule,
    StorageModule,
    HealthModule,
    QuizzesModule,
    CertificatesModule,
    BlogModule,
    CareerPathsModule,
    CommentsModule,
    AiModule,
    AdminModule,
    DemoRequestsModule,
    SiteContentModule,
    ContactMessagesModule,
    ReviewsModule,
    InstructorsModule,
  ],
  providers: [
    // @Throttle() decorators (used on AI chat + code-execution endpoints)
    // had no effect without this — there was no guard actually reading
    // that metadata and enforcing limits.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

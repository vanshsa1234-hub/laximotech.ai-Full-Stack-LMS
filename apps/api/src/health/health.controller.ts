import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    // Check DB connection
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status:    'ok',
      timestamp: new Date().toISOString(),
      service:   'laximotech-api',
      version:   '1.0.0',
      database:  'connected',
    };
  }
}

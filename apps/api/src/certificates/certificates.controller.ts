import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard }        from '../auth/guards/jwt-auth.guard';
import { RolesGuard }          from '../auth/guards/roles.guard';
import { Roles }               from '../auth/decorators/roles.decorator';
import { CurrentUser }         from '../auth/decorators/current-user.decorator';
import { Public }              from '../auth/decorators/public.decorator';
import { Role }                from '@prisma/client';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private certs: CertificatesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMy(@CurrentUser() user: any) {
    return this.certs.getMyCertificates(user.id);
  }

  @Public()
  @Get('verify/:certificateNo')
  verify(@Param('certificateNo') certificateNo: string) {
    return this.certs.verifyCertificate(certificateNo);
  }

  // Admin
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('issue')
  issue(@Body() body: { userId: string; courseId: string; finalScore?: number }) {
    return this.certs.issueCertificate(body.userId, body.courseId, body.finalScore);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('revoke/:certificateNo')
  revoke(@Param('certificateNo') certificateNo: string) {
    return this.certs.revokeCertificate(certificateNo);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/generate-pdf')
  generatePdf(@Param('id') id: string) {
    return this.certs.generateCertificatePdf(id);
  }
}

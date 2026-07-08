import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService }  from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import * as puppeteer from 'puppeteer';

@Injectable()
export class CertificatesService {
  constructor(
    private prisma:   PrismaService,
    private storage:  StorageService,
  ) {}

  async getMyCertificates(userId: string) {
    const certs = await this.prisma.certificate.findMany({
      where:   { userId, status: 'ISSUED' },
      orderBy: { issuedAt: 'desc' },
      include: {
        course: { select: { id: true, slug: true, title: true, category: true } },
      },
    });

    // pdfUrl/imageUrl are stored as raw S3 keys — resolve them to real,
    // clickable URLs here rather than leaving that to the frontend.
    return Promise.all(certs.map(async c => ({
      ...c,
      pdfUrl:   c.pdfUrl ? await this.storage.getViewUrl(c.pdfUrl, 3600) : null,
      imageUrl: c.imageUrl ? this.storage.getPublicUrl(c.imageUrl) : null,
    })));
  }

  async verifyCertificate(certificateNo: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { certificateNo },
      include: {
        user:   { select: { name: true } },
        course: { select: { title: true, category: true } },
      },
    });

    if (!cert || cert.status === 'REVOKED') {
      return { valid: false, message: 'Certificate not found or has been revoked.' };
    }

    return {
      valid:          true,
      certificateNo:  cert.certificateNo,
      holderName:     cert.user.name ?? 'Student',
      courseTitle:    cert.course.title,
      issuedAt:       cert.issuedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      finalScore:     cert.finalScore,
      pdfUrl:         cert.pdfUrl ? await this.storage.getViewUrl(cert.pdfUrl, 3600) : null,
      imageUrl:       cert.imageUrl ? this.storage.getPublicUrl(cert.imageUrl) : null,
    };
  }

  async generateCertificatePdf(certificateId: string): Promise<string> {
    const cert = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user:   { select: { name: true } },
        course: { select: { title: true } },
      },
    });
    if (!cert) throw new NotFoundException('Certificate not found.');

    const customTemplate = await this.prisma.siteContent.findUnique({ where: { key: 'certificate-template' } });
    const templateData = customTemplate?.data as any;

    const certData = {
      holderName:     cert.user.name ?? 'Student',
      courseTitle:    cert.course.title,
      certificateNo:  cert.certificateNo,
      issuedAt:       cert.issuedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      finalScore:     cert.finalScore ?? 0,
    };

    // Use the admin's custom background + field layout if one has been
    // configured in /admin/certificate-template; otherwise fall back to the
    // built-in design so nothing breaks for admins who never touch that page.
    const html = templateData?.backgroundImageUrl
      ? this.buildCustomCertificateHtml(templateData, certData)
      : this.buildCertificateHtml(certData);

    let browser: puppeteer.Browser | null = null;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.emulateMediaType('screen');

      const pdf = await page.pdf({
        format:              'A4',
        landscape:           true,
        printBackground:     true,
        margin:              { top: '0', right: '0', bottom: '0', left: '0' },
      });

      // Upload to S3
      const key = `certificates/${cert.certificateNo}.pdf`;
      await this.storage.uploadBuffer(key, Buffer.from(pdf), 'application/pdf');

      // Save key to DB
      await this.prisma.certificate.update({
        where: { id: certificateId },
        data:  { pdfUrl: key },
      });

      return key;
    } finally {
      if (browser) await browser.close();
    }
  }

  // Admin: issue certificate manually
  async issueCertificate(userId: string, courseId: string, finalScore?: number) {
    const cert = await this.prisma.certificate.upsert({
      where:  { userId_courseId: { userId, courseId } },
      update: { status: 'ISSUED', finalScore },
      create: { userId, courseId, finalScore },
      include: {
        user:   { select: { name: true } },
        course: { select: { title: true } },
      },
    });

    // Generate PDF in background (don't await — takes a few seconds)
    this.generateCertificatePdf(cert.id).catch(err =>
      console.error('Certificate PDF generation failed:', err),
    );

    return cert;
  }

  // Admin: revoke
  async revokeCertificate(certificateNo: string) {
    return this.prisma.certificate.update({
      where: { certificateNo },
      data:  { status: 'REVOKED' },
    });
  }

  // Admin-configured design: a background image with each dynamic field
  // (name, course, score, date, cert number) positioned by percentage so it
  // scales correctly regardless of the uploaded image's native resolution.
  private buildCustomCertificateHtml(
    template: { backgroundImageUrl: string; fields: Record<string, any> },
    data: { holderName: string; courseTitle: string; certificateNo: string; issuedAt: string; finalScore: number },
  ): string {
    const values: Record<string, string> = {
      holderName:    data.holderName,
      courseTitle:   data.courseTitle,
      finalScore:    `${data.finalScore}%`,
      issuedAt:      data.issuedAt,
      certificateNo: data.certificateNo,
    };

    const overlays = Object.entries(template.fields)
      .filter(([, f]: [string, any]) => f.show !== false)
      .map(([key, f]: [string, any]) => `
        <div style="
          position:absolute; left:${f.x}%; top:${f.y}%;
          transform:translate(${f.textAlign === 'left' ? '0' : f.textAlign === 'right' ? '-100%' : '-50%'}, -50%);
          font-size:${f.fontSize}px; color:${f.color}; font-weight:${f.fontWeight};
          font-family:${f.fontFamily}; text-align:${f.textAlign}; white-space:nowrap;
        ">${values[key] ?? ''}</div>`).join('');

    return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" />
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:297mm; height:210mm; overflow:hidden; }
  .cert { position:relative; width:297mm; height:210mm;
    background:url('${template.backgroundImageUrl}') center/cover no-repeat; }
</style>
</head>
<body><div class="cert">${overlays}</div></body>
</html>`;
  }

  private buildCertificateHtml(data: {
    holderName: string; courseTitle: string;
    certificateNo: string; issuedAt: string; finalScore: number;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Playfair+Display:wght@400;600;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width: 297mm; height: 210mm;
      background: #1F4E79;
      font-family: 'Poppins', sans-serif;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .cert {
      width: 285mm; height: 198mm;
      background: linear-gradient(135deg, #0f1729 0%, #1F4E79 50%, #2d1b69 100%);
      border: 2px solid rgba(255,107,0,0.4);
      border-radius: 16px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      position: relative; overflow: hidden; padding: 24px;
      box-shadow: 0 0 60px rgba(255,107,0,0.15);
    }
    .border-inner {
      position: absolute; inset: 10px;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px; pointer-events: none;
    }
    .corner {
      position: absolute; width: 40px; height: 40px;
      border-color: rgba(255,107,0,0.6); border-style: solid;
    }
    .corner.tl { top:18px;left:18px; border-width:3px 0 0 3px; border-radius:8px 0 0 0; }
    .corner.tr { top:18px;right:18px; border-width:3px 3px 0 0; border-radius:0 8px 0 0; }
    .corner.bl { bottom:18px;left:18px; border-width:0 0 3px 3px; border-radius:0 0 0 8px; }
    .corner.br { bottom:18px;right:18px; border-width:0 3px 3px 0; border-radius:0 0 8px 0; }
    .brand {
      color: #FF6B00; font-size: 11px; font-weight: 700;
      letter-spacing: 4px; text-transform: uppercase; margin-bottom: 6px;
    }
    .tagline { color: rgba(255,255,255,0.4); font-size: 9px; letter-spacing: 2px; margin-bottom: 18px; }
    .cert-title {
      color: rgba(255,255,255,0.6); font-size: 11px;
      letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;
    }
    .holder {
      font-family: 'Playfair Display', serif;
      font-size: 36px; font-weight: 700; color: #fff;
      text-align: center; margin-bottom: 8px;
      text-shadow: 0 0 30px rgba(255,107,0,0.3);
    }
    .completed { color: rgba(255,255,255,0.5); font-size: 11px; margin-bottom: 8px; }
    .course {
      font-size: 17px; font-weight: 700; color: #FF6B00;
      text-align: center; margin-bottom: 20px; max-width: 420px; line-height: 1.3;
    }
    .divider {
      width: 120px; height: 1px;
      background: linear-gradient(to right, transparent, rgba(255,107,0,0.6), transparent);
      margin-bottom: 20px;
    }
    .meta {
      display: flex; gap: 48px; align-items: center;
    }
    .meta-item { text-align: center; }
    .meta-label { color: rgba(255,255,255,0.4); font-size: 8px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .meta-value { color: #fff; font-size: 11px; font-weight: 600; }
    .seal {
      position: absolute; bottom: 24px; right: 32px;
      width: 64px; height: 64px; border-radius: 50%;
      background: linear-gradient(135deg, #FF6B00, #FFB347);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 20px rgba(255,107,0,0.5);
    }
    .seal-text { color: #fff; font-size: 7px; font-weight: 800; text-align: center; line-height: 1.3; letter-spacing: 0.5px; }
  </style>
</head>
<body>
<div class="cert">
  <div class="border-inner"></div>
  <div class="corner tl"></div><div class="corner tr"></div>
  <div class="corner bl"></div><div class="corner br"></div>

  <div class="brand">laximotech.ai</div>
  <div class="tagline">India's Most Affordable AI & Tech Learning Platform</div>
  <div class="cert-title">Certificate of Completion</div>
  <div class="holder">${data.holderName}</div>
  <div class="completed">has successfully completed the course</div>
  <div class="course">${data.courseTitle}</div>
  <div class="divider"></div>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">Score</div>
      <div class="meta-value">${data.finalScore}%</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Issue Date</div>
      <div class="meta-value">${data.issuedAt}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Certificate ID</div>
      <div class="meta-value" style="font-size:9px;font-family:monospace">${data.certificateNo}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Verify At</div>
      <div class="meta-value" style="font-size:9px">laximotech.ai/verify</div>
    </div>
  </div>

  <div class="seal">
    <div class="seal-text">CERTIFIED<br/>✓</div>
  </div>
</div>
</body>
</html>`;
  }
}

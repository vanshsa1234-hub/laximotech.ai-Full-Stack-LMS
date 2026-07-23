import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import * as puppeteer from 'puppeteer';

jest.mock('puppeteer', () => {
  const mockPage = {
  setContent: jest.fn().mockResolvedValue(undefined),
  emulateMediaType: jest.fn().mockResolvedValue(undefined),
  // Resolves truthy for both calls the real service makes: the font-load
  // wait (return value unused) and the background-image load check (must
  // be truthy or the service throws "background image failed to load").
  evaluate: jest.fn().mockResolvedValue(true),
  pdf: jest.fn().mockResolvedValue(Buffer.from('pdf-bytes')),
};
  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn().mockResolvedValue(undefined),
  };
  return {
    launch: jest.fn().mockResolvedValue(mockBrowser),
    __mockBrowser: mockBrowser,
    __mockPage: mockPage,
  };
});


const mockBrowser = (puppeteer as any).__mockBrowser;
const mockPage = (puppeteer as any).__mockPage;

describe('CertificatesService', () => {
  let service: CertificatesService;
  let prisma: any;
  let storage: any;

  beforeEach(async () => {
    prisma = {
      certificate: { findMany: jest.fn(), findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn() },
      siteContent: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    storage = {
      getViewUrl: jest.fn().mockResolvedValue('https://signed.example.com/cert.pdf'),
      getPublicUrl: jest.fn().mockReturnValue('https://cdn.example.com/cert.png'),
      uploadBuffer: jest.fn().mockResolvedValue('certificates/CERT-1.pdf'),
      saveGeneratedFile: jest.fn().mockResolvedValue('http://localhost:4000/uploads/certificates/CERT-1.pdf'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CertificatesService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = moduleRef.get(CertificatesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getMyCertificates', () => {
    it('resolves pdfUrl/imageUrl to real URLs for each certificate', async () => {
      prisma.certificate.findMany.mockResolvedValue([
        { id: 'c1', pdfUrl: 'certs/c1.pdf', imageUrl: 'certs/c1.png' },
        { id: 'c2', pdfUrl: null, imageUrl: null },
      ]);
      const result = await service.getMyCertificates('u1');
      expect(result[0].pdfUrl).toBe('https://signed.example.com/cert.pdf');
      expect(result[0].imageUrl).toBe('https://cdn.example.com/cert.png');
      expect(result[1].pdfUrl).toBeNull();
      expect(result[1].imageUrl).toBeNull();
    });
  });

  describe('verifyCertificate', () => {
    it('returns invalid for a missing certificate', async () => {
      prisma.certificate.findUnique.mockResolvedValue(null);
      const result = await service.verifyCertificate('CERT-MISSING');
      expect(result.valid).toBe(false);
    });

    it('returns invalid for a revoked certificate', async () => {
      prisma.certificate.findUnique.mockResolvedValue({ status: 'REVOKED' });
      const result = await service.verifyCertificate('CERT-1');
      expect(result.valid).toBe(false);
    });

    it('returns full details for a valid, issued certificate', async () => {
      prisma.certificate.findUnique.mockResolvedValue({
        status: 'ISSUED', certificateNo: 'CERT-1',
        user: { name: 'Jane' }, course: { title: 'Course A' },
        issuedAt: new Date('2026-01-01'), finalScore: 90, pdfUrl: null, imageUrl: null,
      });
      const result = await service.verifyCertificate('CERT-1');
      expect(result.valid).toBe(true);
      expect(result.holderName).toBe('Jane');
      expect(result.courseTitle).toBe('Course A');
    });

    it('falls back to "Student" when the holder has no name', async () => {
      prisma.certificate.findUnique.mockResolvedValue({
        status: 'ISSUED', certificateNo: 'CERT-1',
        user: { name: null }, course: { title: 'Course A' },
        issuedAt: new Date(), finalScore: 90, pdfUrl: null, imageUrl: null,
      });
      const result = await service.verifyCertificate('CERT-1');
      expect(result.holderName).toBe('Student');
    });
  });

  describe('generateCertificatePdf', () => {
    it('throws NotFoundException when the certificate does not exist', async () => {
      prisma.certificate.findUnique.mockResolvedValue(null);
      await expect(service.generateCertificatePdf('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('renders, saves the PDF via saveGeneratedFile, and closes the browser', async () => {
      prisma.certificate.findUnique.mockResolvedValue({
        id: 'cert1', certificateNo: 'CERT-1', finalScore: 88,
        issuedAt: new Date('2026-01-01'),
        user: { name: 'Jane' }, course: { title: 'Course A' },
      });
      prisma.certificate.update.mockResolvedValue({});

      const stored = await service.generateCertificatePdf('cert1');

      expect(stored).toBe('http://localhost:4000/uploads/certificates/CERT-1.pdf');
      expect(storage.saveGeneratedFile).toHaveBeenCalledWith(
        'certificates', 'CERT-1.pdf', expect.any(Buffer), 'application/pdf',
      );
      expect(prisma.certificate.update).toHaveBeenCalledWith({
        where: { id: 'cert1' },
        data: { pdfUrl: 'http://localhost:4000/uploads/certificates/CERT-1.pdf' },
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('closes the browser even if PDF rendering throws', async () => {
      prisma.certificate.findUnique.mockResolvedValue({
        id: 'cert1', certificateNo: 'CERT-1', finalScore: 88,
        issuedAt: new Date(), user: { name: 'Jane' }, course: { title: 'Course A' },
      });
      mockPage.pdf.mockRejectedValueOnce(new Error('render failed'));

      await expect(service.generateCertificatePdf('cert1')).rejects.toThrow('render failed');
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('uses the custom template when one is configured', async () => {
      prisma.certificate.findUnique.mockResolvedValue({
        id: 'cert1', certificateNo: 'CERT-1', finalScore: 88,
        issuedAt: new Date(), user: { name: 'Jane' }, course: { title: 'Course A' },
      });
      prisma.siteContent.findUnique.mockResolvedValue({
        data: { backgroundImageUrl: 'https://example.com/bg.png', fields: { holderName: { x: 50, y: 50, fontSize: 20, color: '#000', fontWeight: '700', fontFamily: 'Arial', textAlign: 'center' } } },
      });
      prisma.certificate.update.mockResolvedValue({});

      await service.generateCertificatePdf('cert1');
      expect(mockPage.setContent).toHaveBeenCalledWith(expect.stringContaining('bg.png'), expect.any(Object));
    });
  });

  describe('issueCertificate', () => {
    it('upserts the certificate and triggers background PDF generation', async () => {
      prisma.certificate.upsert.mockResolvedValue({ id: 'cert1', certificateNo: 'CERT-1', user: {}, course: {} });
      prisma.certificate.findUnique.mockResolvedValue({
        id: 'cert1', certificateNo: 'CERT-1', finalScore: 90,
        issuedAt: new Date(), user: { name: 'Jane' }, course: { title: 'C' },
      });
      prisma.certificate.update.mockResolvedValue({});

      const result = await service.issueCertificate('u1', 'course1', 90);
      expect(result.id).toBe('cert1');
      expect(prisma.certificate.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId_courseId: { userId: 'u1', courseId: 'course1' } } }),
      );
    });
  });

  describe('revokeCertificate', () => {
    it('sets status to REVOKED', async () => {
      prisma.certificate.update.mockResolvedValue({});
      await service.revokeCertificate('CERT-1');
      expect(prisma.certificate.update).toHaveBeenCalledWith({
        where: { certificateNo: 'CERT-1' }, data: { status: 'REVOKED' },
      });
    });
  });
});
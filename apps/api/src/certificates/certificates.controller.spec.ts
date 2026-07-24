import { Test } from '@nestjs/testing';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';

describe('CertificatesController', () => {
  let controller: CertificatesController;
  let service: any;

  beforeEach(async () => {
    service = {
      getMyCertificates: jest.fn().mockResolvedValue([]),
      verifyCertificate: jest.fn().mockResolvedValue({}),
      issueCertificate: jest.fn().mockResolvedValue({}),
      revokeCertificate: jest.fn().mockResolvedValue({}),
      generateCertificatePdf: jest.fn().mockResolvedValue('key'),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [CertificatesController],
      providers: [{ provide: CertificatesService, useValue: service }],
    }).compile();
    controller = moduleRef.get(CertificatesController);
  });

  it('getMy forwards user id', () => {
    controller.getMy({ id: 'u1' });
    expect(service.getMyCertificates).toHaveBeenCalledWith('u1');
  });

  it('verify forwards certificateNo', () => {
    controller.verify('CERT-1');
    expect(service.verifyCertificate).toHaveBeenCalledWith('CERT-1');
  });

  it('issue forwards userId, courseId, finalScore', () => {
    controller.issue({ userId: 'u1', courseId: 'c1', finalScore: 90 });
    expect(service.issueCertificate).toHaveBeenCalledWith('u1', 'c1', 90);
  });

  it('revoke forwards certificateNo', () => {
    controller.revoke('CERT-1');
    expect(service.revokeCertificate).toHaveBeenCalledWith('CERT-1');
  });

  it('generatePdf forwards id', () => {
    controller.generatePdf('cert1');
    expect(service.generateCertificatePdf).toHaveBeenCalledWith('cert1');
  });
});

import { Test } from '@nestjs/testing';
import { SiteContentService } from './site-content.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SiteContentService', () => {
  let service: SiteContentService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      siteContent: { findUnique: jest.fn(), findMany: jest.fn(), upsert: jest.fn(), deleteMany: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [SiteContentService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(SiteContentService);
  });

  afterEach(() => jest.clearAllMocks());

  it('get returns the DB row when customized', async () => {
    prisma.siteContent.findUnique.mockResolvedValue({ data: { custom: true } });
    const result = await service.get('about');
    expect(result.isCustomized).toBe(true);
    expect(result.data).toEqual({ custom: true });
  });

  it('get falls back to built-in defaults when no row exists', async () => {
    prisma.siteContent.findUnique.mockResolvedValue(null);
    const result = await service.get('contact');
    expect(result.isCustomized).toBe(false);
    expect(result.data.email).toBe('hello@laximotech.ai');
  });

  it('get returns an empty object for an unknown key with no row', async () => {
    prisma.siteContent.findUnique.mockResolvedValue(null);
    const result = await service.get('totally-unknown-key');
    expect(result.data).toEqual({});
  });

  it('getAll merges DB overrides with defaults for every known key', async () => {
    prisma.siteContent.findMany.mockResolvedValue([{ key: 'contact', data: { email: 'custom@x.com' }, updatedAt: new Date() }]);
    const result = await service.getAll();
    const contactEntry = result.find((r) => r.key === 'contact');
    expect(contactEntry?.isCustomized).toBe(true);
    expect(contactEntry?.data.email).toBe('custom@x.com');

    const aboutEntry = result.find((r) => r.key === 'about');
    expect(aboutEntry?.isCustomized).toBe(false);
  });

  it('upsert creates or updates the row for a key', async () => {
    prisma.siteContent.upsert.mockResolvedValue({});
    await service.upsert('faq', { items: [] });
    expect(prisma.siteContent.upsert).toHaveBeenCalledWith({
      where: { key: 'faq' }, create: { key: 'faq', data: { items: [] } }, update: { data: { items: [] } },
    });
  });

  it('resetToDefault deletes the override and returns the built-in default', async () => {
    prisma.siteContent.deleteMany.mockResolvedValue({});
    const result = await service.resetToDefault('terms');
    expect(prisma.siteContent.deleteMany).toHaveBeenCalledWith({ where: { key: 'terms' } });
    expect(result.isCustomized).toBe(false);
    expect(result.data.lastUpdated).toBe('June 2025');
  });
});

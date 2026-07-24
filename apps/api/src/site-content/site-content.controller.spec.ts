import { Test } from '@nestjs/testing';
import { SiteContentController } from './site-content.controller';
import { SiteContentService } from './site-content.service';

describe('SiteContentController', () => {
  let controller: SiteContentController;
  let service: any;

  beforeEach(async () => {
    service = {
      get: jest.fn().mockResolvedValue({}),
      getAll: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue({}),
      resetToDefault: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [SiteContentController],
      providers: [{ provide: SiteContentService, useValue: service }],
    }).compile();
    controller = moduleRef.get(SiteContentController);
  });

  it('get forwards key', () => {
    controller.get('about');
    expect(service.get).toHaveBeenCalledWith('about');
  });

  it('getAll delegates to service', () => {
    controller.getAll();
    expect(service.getAll).toHaveBeenCalled();
  });

  it('upsert forwards key and data', () => {
    controller.upsert('faq', { data: { items: [] } });
    expect(service.upsert).toHaveBeenCalledWith('faq', { items: [] });
  });

  it('resetToDefault forwards key', () => {
    controller.resetToDefault('terms');
    expect(service.resetToDefault).toHaveBeenCalledWith('terms');
  });
});

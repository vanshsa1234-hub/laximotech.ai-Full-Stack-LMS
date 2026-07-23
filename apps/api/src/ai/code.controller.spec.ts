import { Test } from '@nestjs/testing';
import { CodeController } from './code.controller';
import { CodeService } from './code.service';

describe('CodeController', () => {
  let controller: CodeController;
  let service: any;

  beforeEach(async () => {
    service = { execute: jest.fn().mockResolvedValue({}) };
    const moduleRef = await Test.createTestingModule({
      controllers: [CodeController],
      providers: [{ provide: CodeService, useValue: service }],
    }).compile();
    controller = moduleRef.get(CodeController);
  });

  it('run forwards the execution body', () => {
    const body = { languageId: 71, sourceCode: 'print(1)' };
    controller.run({ id: 'u1' }, body);
    expect(service.execute).toHaveBeenCalledWith(body);
  });

  it('runPublic forwards the execution body without a user', () => {
    const body = { languageId: 71, sourceCode: 'print(1)' };
    controller.runPublic(body);
    expect(service.execute).toHaveBeenCalledWith(body);
  });
});

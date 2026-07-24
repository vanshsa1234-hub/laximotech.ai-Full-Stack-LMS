import { Module }          from '@nestjs/common';
import { AiController }    from './ai.controller';
import { AiService }       from './ai.service';
import { CodeController }  from './code.controller';
import { CodeService }     from './code.service';

@Module({
  controllers: [AiController, CodeController],
  providers:   [AiService, CodeService],
  exports:     [AiService, CodeService],
})
export class AiModule {}

import { Module }          from '@nestjs/common';
import { AiController }    from './ai.controller';
import { AiService }       from './ai.service';
import { CodeController }  from './code.controller';
import { CodeService }     from './code.service';
import { RagModule }       from './rag/rag.module';

@Module({
  imports:     [RagModule],
  controllers: [AiController, CodeController],
  providers:   [AiService, CodeService],
  exports:     [AiService, CodeService, RagModule],
})
export class AiModule {}
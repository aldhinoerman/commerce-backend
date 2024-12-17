import { Module } from '@nestjs/common';
import { ApploggerService } from './applogger.service';

@Module({
  providers: [ApploggerService],
  exports: [ApploggerService],
})
export class ApploggerModule {}

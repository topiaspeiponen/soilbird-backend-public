import { HttpModule, Module } from '@nestjs/common';
import { SoilscoutService } from './soilscout.service';
import { SoilscoutController } from './soilscout.controller';

@Module({
  imports: [HttpModule],
  controllers: [SoilscoutController],
  providers: [SoilscoutService],
  exports: [SoilscoutService]
})
export class SoilscoutModule {}

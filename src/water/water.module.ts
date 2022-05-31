import { HttpModule, Module } from '@nestjs/common';
import { WaterService } from './water.service';
import { WaterController } from './water.controller';

@Module({
  imports: [HttpModule],
  controllers: [WaterController],
  providers: [WaterService]
})
export class WaterModule {}

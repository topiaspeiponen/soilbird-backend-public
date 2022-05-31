import { Turfs } from './entities/turfs.entity';
import { SportsProperties } from './entities/sports_property.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SportsProperties, Turfs])
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService]
})
export class PropertyModule {}

import { PropertyModule } from './../property/property.module';
import { SoilscoutModule } from './../soilscout/soilscout.module';
import { Notifications, NotificationsLogic } from './entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoilscoutService } from './../soilscout/soilscout.service';
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notifications, NotificationsLogic]),
    SoilscoutModule,
    PropertyModule
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService]
})
export class NotificationsModule {}

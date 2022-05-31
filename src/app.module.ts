import { SportsProperties } from './property/entities/sports_property.entity';
import { Turfs } from './property/entities/turfs.entity';
import { Notifications, NotificationsLogic } from './notifications/entities/notification.entity';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SoilscoutModule } from './soilscout/soilscout.module';
import { PropertyModule } from './property/property.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users/entities/users.entity';
import { Sector } from './sectors/entities/sector.entity';
import { Connection } from 'typeorm';
import { NotificationsModule } from './notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { WaterModule } from './water/water.module';
import { SectorsModule } from './sectors/sectors.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: 'soilbird',
      entities: [Users, Notifications, Turfs, SportsProperties, NotificationsLogic, Sector],
    }),
    ScheduleModule.forRoot(),
    SoilscoutModule,
    UsersModule,
    NotificationsModule,
    PropertyModule,
    AuthModule,
    WaterModule,
    SectorsModule,
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
  constructor(private connection: Connection) {
    
  }
}

import { NotificationsLogic } from './entities/notification.entity';
import { UsersGuard } from 'src/users/users.guard';
import { JwtAuthGuard } from 'src/users/jwt-auth-guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import {Tokens} from 'src/tokens.decorator';
import {Roles} from 'src/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, UsersGuard)
@Tokens('access')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles('worker')
  @Get('all')
  async getAllNotifications() {
    return await this.notificationsService.getAllNotifications();
  }

  @Roles('worker')
  @Get('all/:propertyId')
  async getAllNotificationsForSportsProperty(
    @Param('propertyId') id: number
  ) {
    return await this.notificationsService.getAllNotificationsForSportsProperty(id);
  }

  @Roles('worker')
  @Put('mark')
  async markNotificationAsRead(
    @Body() body : {data: {notificationId: number, userId: number}}
  ) {
    console.log(body.data)
    return await this.notificationsService.markNotificationAsRead(body.data.notificationId, body.data.userId)
  }

  @Roles('worker')
  @Get('filtered')
  async getAllNotificationsForSportsPropertyFilteredByUserID(
    @Query('propertyId') propertyId: number,
    @Query('userId') userId: string
  ) {
    return await this.notificationsService.getAllNotificationsForSportsPropertyFilteredByUserID(userId, propertyId);
  }

  @Roles('worker')
  @Get('logic')
  async getNotificationsLogic(
    @Query('turf_id') turf_id: number,
    @Query('sportsPropertyId') sportsPropertyId: number
  ) {
    return await this.notificationsService.getNotificationsLogic(turf_id, sportsPropertyId)
  }

  @Roles('admin')
  @Put('logic/update')
  async updateNotificationsLogic(
    @Body() notificationsLogic : NotificationsLogic
  ) {
    console.log('update notifications logic', notificationsLogic)
    return await this.notificationsService.updateNotificationsLogic(notificationsLogic);
  }

  @Roles('admin')
  @Post('logic/create')
  async createNotificationsLogic(
    @Body() notificationsLogic: NotificationsLogic
  ) {
    console.log('create notifications logic ', notificationsLogic)
    return await this.notificationsService.createNotificationsLogic(notificationsLogic);
  }

  @Roles('admin')
  @Delete('logic/delete')
  async deleteNotificationsLogic(
    @Query('turfId') turfId: number,
    @Query('propertyId') propertyId: number
  ) {
    console.log('delete notifications logic', turfId, propertyId)
    return await this.notificationsService.deleteNotificationsLogic(turfId, propertyId);
  }


  @Roles('admin')
  @Get('logic/all')
  async getAllNotificationsLogic() {
    return await this.notificationsService.getAllNotificationsLogic();
  }

}

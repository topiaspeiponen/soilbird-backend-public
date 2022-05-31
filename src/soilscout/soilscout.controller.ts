import { SoilscoutDevice, SoilscoutDevicePost, SoilscoutGroup, SoilscoutGroupPost } from './dto/soilscout.dto';
import { UsersGuard } from 'src/users/users.guard';
import { JwtAuthGuard } from './../users/jwt-auth-guard';
import { SoilscoutErrorInterceptor } from './soilscout-error.interceptor';
import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Query, UseInterceptors, UseGuards, Put} from '@nestjs/common';
import { SoilscoutService } from './soilscout.service';
import {Roles} from 'src/roles.decorator';
import {Tokens} from 'src/tokens.decorator';


@Controller('soilscout')
@UseGuards(JwtAuthGuard, UsersGuard)
@Tokens('access')
@UseInterceptors(new SoilscoutErrorInterceptor())
export class SoilscoutController {
  constructor(private readonly soilscoutService: SoilscoutService) {}

  // Devices
  @Roles('worker')
  @Get('devices')
  async getSiteDevices(
    @Query('site') site: number,
  ) {
    console.log(site)
    return await this.soilscoutService.getSiteDevices(site)
  }
  @Roles('worker')
  @Post('devices/ids')
  async getSiteDevicesByID(
    @Query('site') site: number,
    @Body('data') data: any
  ) {
    console.log('IDS' , data.ids)
    return await this.soilscoutService.getSiteDevicesByID(site, data.ids)
  }

  @Roles('admin')
  @Post('devices')
  async createDevice(
    @Body() device: SoilscoutDevicePost
  ) {
    return await this.soilscoutService.createDevice(device);
  }

  @Roles('admin')
  @Patch('devices/:id')
  async updateDevice(
    @Param('id') id: number,
    @Body() device: SoilscoutDevicePost
  ) {
    return await this.soilscoutService.updateDevice(id, device);
  }

  @Roles('admin')
  @Delete('devices/:id')
  async deleteDevice(
    @Param('id') id: number
  ) {
    return await this.soilscoutService.deleteDevice(id);
  }

  @Roles('admin')
  @Post('groups')
  async createGroup(
    @Body() group: SoilscoutGroupPost
  ) {
    return await this.soilscoutService.createGroup(group);
  }

  @Roles('admin')
  @Patch('groups/:id')
  async updateGroup(
    @Param('id') id: number,
    @Body() group: SoilscoutGroupPost
  ) {
    return await this.soilscoutService.updateGroup(id, group);
  }

  @Roles('admin')
  @Delete('groups/:id')
  async deleteGroup(
    @Param('id') id: number
  ) {
    return await this.soilscoutService.deleteGroup(id);
  }

  @Roles('worker')
  @Get('groups')
  async getSiteGroups(
    @Query('site') site: number
  ) {
    return await this.soilscoutService.getSiteGroups(site)
  }

  // Measurements
  @Roles('worker')
  @Get('measurements/aggregated')
  async getDevicesMeasurementsAggr(
    @Query('since') since: Date,
    @Query('until') until: Date,
    @Query('devices') devices: string,
    @Query('window_size') window_size: number,
    @Query('aggregate_all') aggregate_all: boolean
  ) {
    return await this.soilscoutService.getDevicesMeasurementsAggr(since, until, devices, window_size, aggregate_all)
  }
}

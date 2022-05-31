import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {Roles} from 'src/roles.decorator';
import {Tokens} from 'src/tokens.decorator';
import {JwtAuthGuard} from 'src/users/jwt-auth-guard';
import {UsersGuard} from 'src/users/users.guard';
import { WaterService } from './water.service';

@Controller('water')
export class WaterController {
  constructor(private readonly waterService: WaterService) {}

  @UseGuards(JwtAuthGuard, UsersGuard)
  @Roles('worker')
  @Tokens('access')
  @Get('property')
  getWaterConsumptionForProperty(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
    @Query('zip') zipCode: string
  ) {
    return this.waterService.getWaterConsumptionForProperty(startDate, endDate, zipCode)
  }
}

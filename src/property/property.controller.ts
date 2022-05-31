import { Turfs } from './entities/turfs.entity';
import { SportsProperties } from './entities/sports_property.entity';
import { JwtAuthGuard } from 'src/users/jwt-auth-guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import {UsersGuard} from 'src/users/users.guard';
import {Roles} from 'src/roles.decorator';
import {Tokens} from 'src/tokens.decorator';

@Controller('property')
@UseGuards(JwtAuthGuard, UsersGuard)
@Tokens('access')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

 @Get('')
 test() {
   return this.propertyService.test()
 }

 @Roles('worker')
 @Get('all')
 getAllSportsProperties() {
   return this.propertyService.getAllSportsProperties();
 }

 @Roles('worker')
 @Get('turfs/all')
 getAllTurfs() {
   return this.propertyService.getAllTurfs();
 }

 @Roles('worker')
 @Get('turfs/:sportsPropertyId')
 getAllTurfsInSportsProperty(
   @Param('sportsPropertyId') sportsPropertyId : number
 ) {
  return this.propertyService.getAllTurfsInProperty(sportsPropertyId);
 }

 @Roles('admin')
 @Post('create')
 createSportsProperty(
   @Body() sportsProperty : SportsProperties
 ) {
   return this.propertyService.createSportsProperty(sportsProperty)
 }

 @Roles('admin')
 @Post('turfs/create')
 createTurf(
   @Body() turf: Turfs
 ) {
   return this.propertyService.createTurf(turf)
 }

 @Roles('admin')
 @Put('update')
 editSportsProperty(
   @Body() sportsProperty: SportsProperties
 ) {
   return this.propertyService.editSportsProperty(sportsProperty)
 }

 @Roles('admin')
 @Put('turfs/update')
 editTurf(
   @Body() turf: Turfs
 ) {
   return this.propertyService.editTurf(turf)
 }

 @Roles('admin')
 @Delete('delete')
 deleteSportsProperty(
   @Query('id') id: number
 ) {
   return this.propertyService.deleteSportsProperty(id)
 }

 @Roles('admin')
 @Delete('turfs/delete')
 deleteTurf(
   @Query('id') id: number
 ) {
   return this.propertyService.deleteTurf(id)
 }
}

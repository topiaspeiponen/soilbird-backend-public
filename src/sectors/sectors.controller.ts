import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SectorsService } from './sectors.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import {JwtAuthGuard} from 'src/users/jwt-auth-guard';
import {UsersGuard} from 'src/users/users.guard';
import {Tokens} from 'src/tokens.decorator';
import {Roles} from 'src/roles.decorator';

@UseGuards(JwtAuthGuard, UsersGuard)
@Tokens('access')
@Controller('sectors')
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}



  @Roles('worker')
  @Get()
  findAll() {
    return this.sectorsService.findAll();
  }

  @Roles('worker')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectorsService.findOne(+id);
  }
  @Roles('worker')
  @Get('/turfID/:id')
  findByTurfID(@Param('id') id: string) {
    return this.sectorsService.findByTurfID(+id);
  }

  @Post()
  create(@Body() createSectorDto: CreateSectorDto) {
    return this.sectorsService.create(createSectorDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectorDto: UpdateSectorDto) {
    return this.sectorsService.update(+id, updateSectorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectorsService.remove(+id);
  }
}

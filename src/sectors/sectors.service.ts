import { Sector } from './entities/sector.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import {Repository} from 'typeorm';

@Injectable()
export class SectorsService {
  constructor(
    @InjectRepository(Sector)
    private readonly sectorRepository : Repository<Sector>
  ) {}

  async findAll() {
    try {
      const sectors = await this.sectorRepository.find()
      return sectors
    } catch(err) {
      return Promise.reject(new HttpException('Could not get sectors', HttpStatus.BAD_REQUEST))
    }
  }

  async findOne(id: number) {
    try {
      const sector = await this.sectorRepository.find({
        where: {
          id: id
        }
      })
      return sector
    } catch(err) {
      return Promise.reject(new HttpException('Could not get one sector', HttpStatus.BAD_REQUEST))
    }
  }

  async findByTurfID(id: number) {
    try {
      const sector = await this.sectorRepository.find({
        where: {
          turf_id: id
        }
      })
      return sector
    } catch(err) {
      return Promise.reject(new HttpException('Could not get sectors by turf id', HttpStatus.BAD_REQUEST))
    }
  }

  async create(createSectorDto : CreateSectorDto) {
    try {
      const sector = await this.sectorRepository.insert(createSectorDto)
      return sector
    } catch(err) {
      return Promise.reject(new HttpException('Could not create sector', HttpStatus.BAD_REQUEST))
    }
  }

  async update(id: number, updateSectorDto: UpdateSectorDto) {
    try {
      const response = await this.sectorRepository.update({
        id: id
      }, updateSectorDto)
      return response
    } catch(err) {
      return Promise.reject(new HttpException('Could not get update sector', HttpStatus.BAD_REQUEST))
    }
  }

  remove(id: number) {
    return `This action removes a #${id} sector`;
  }
}

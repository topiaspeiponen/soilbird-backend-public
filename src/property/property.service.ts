/* eslint-disable prettier/prettier */
import { Turfs } from './entities/turfs.entity';
import { SportsProperties } from './entities/sports_property.entity';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import {Repository} from 'typeorm';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(SportsProperties)
    private readonly sportsPropertyRepository : Repository<SportsProperties>,

    @InjectRepository(Turfs)
    private readonly turfsRepository: Repository<Turfs>
  ) {}

  async test() {
    const xd = await this.sportsPropertyRepository.find()
    const xde = await this.turfsRepository.find()
    console.log('zxd', xd, JSON.stringify(xde))
    return "lol"
  }

  async getAllSportsProperties() {
    try {
      const properties = await this.sportsPropertyRepository.find()
      return properties
    } catch(err) {
      return Promise.reject(new HttpException('Could not get sports properties', HttpStatus.BAD_REQUEST))
    }
  }

  async getAllTurfs() {
    try {
      const turfs = await this.turfsRepository.find()
      return turfs
    } catch(err) {
      return Promise.reject(new HttpException('Could not get turfs', HttpStatus.BAD_REQUEST))
    }
  }

  async getOneTurf(id: number) {
    try {
      return await this.turfsRepository.find({
        where: {
          id: id
        }
      })
    } catch(err) {
      return Promise.reject(new HttpException('Could not get turfs', HttpStatus.BAD_REQUEST))
    }
  }

  async getOneTurfInPropertyBySensorGrp(site_id: number, sensors_group: string) {
    try {
      return await this.turfsRepository.find({
        where: {
          sensors_group: sensors_group,
          sports_properties_id: site_id
        }
      })
    } catch(err) {
      return Promise.reject(new HttpException('Could not get turfs', HttpStatus.BAD_REQUEST))
    }
  }

  async getAllTurfsInProperty(sportsPropertyId : number) {
    try {
      const turfs = await this.turfsRepository.find({
        where: {
          sports_properties_id: sportsPropertyId
        }
      })
      if (turfs.length !== 0) {
        return turfs
      } else {
        throw new Error
      }
    } catch(err) {
      return Promise.reject(new HttpException('Could not get all turfs in property', HttpStatus.BAD_REQUEST))
    }
  }

  async createSportsProperty(sportsProperty: SportsProperties) {
    try {
      let insertableSportsProperty = sportsProperty
      insertableSportsProperty.coordinates = JSON.stringify(sportsProperty.coordinates)
      console.log(' eiditing sports port ', sportsProperty)
      return await this.sportsPropertyRepository.insert(insertableSportsProperty);
    } catch(err) {
      console.log(err)
      return Promise.reject(new HttpException('Could not create property', HttpStatus.BAD_REQUEST))
    }
  }

  async createTurf(turf: Turfs) {
    try {
      const insertableTurf = turf;
      insertableTurf.coordinates = JSON.stringify(turf.coordinates)
      console.log('insertable turf ', insertableTurf)
      return await this.turfsRepository.insert(insertableTurf)
    } catch(err) {
      console.log(err)
      return Promise.reject(new HttpException('Could not create turf', HttpStatus.BAD_REQUEST))
    }
  }

  async editSportsProperty(sportsProperty: SportsProperties) {
    try {
      let insertableSportsProperty = sportsProperty
      insertableSportsProperty.coordinates = JSON.stringify(sportsProperty.coordinates)
      console.log(' eiditing sports port ', sportsProperty)
      return await this.sportsPropertyRepository.update(
        {id: sportsProperty.id}, insertableSportsProperty
      )
    } catch(err) {
      console.log('err ', err)
      return Promise.reject(new HttpException('Could not edit property', HttpStatus.BAD_REQUEST))
    }
  }

  async deleteSportsProperty(id: number) {
    try {
      return await this.sportsPropertyRepository.delete(
        {primary_id: id}
      )
    } catch(err) {
      return Promise.reject(new HttpException('Could not delete property', HttpStatus.BAD_REQUEST))
    }
  }

  async editTurf(turf: Turfs) {
    try {
      const insertableTurf = turf;
      insertableTurf.coordinates = JSON.stringify(turf.coordinates)
      return await this.turfsRepository.update(
        {id: turf.id}, insertableTurf
      )
    } catch(err) {
      console.log('err ', err)
      return Promise.reject(new HttpException('Could not update turf', HttpStatus.BAD_REQUEST))
    }
  }

  async deleteTurf(id: number) {
    try {
      return await this.turfsRepository.delete(
        {id: id}
      )
    } catch(err) {
      return Promise.reject(new HttpException('Could not delete turf', HttpStatus.BAD_REQUEST))
    }
  }
}

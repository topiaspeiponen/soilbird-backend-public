import { JwtAuthGuard } from './jwt-auth-guard';
import { Users } from './entities/users.entity';
import { Injectable, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>
  ) {}

  /**async validateUser(name: string, password: string) {
    try {
      const dbUser = await this.usersRepository.findOne({
        where: {
          name: name
        }
      })
      const returnableUser = {
        id: dbUser.id,
        name: dbUser.name,
        credential_level: dbUser.credential_level
      }
      // User password in DB is encrypted
      const compareHash  = bcrypt.compare(password, dbUser.password)
      console.log('Validating user ', dbUser)
      if (dbUser && compareHash) {
        const payload = {username: name, credential_level: dbUser.credential_level}
        const tokens = {
          access_token: this.jwtService.sign(payload, { expiresIn: '15m'}),
          refresh_token: this.jwtService.sign(payload, { expiresIn: '1h' })
        }
        return {
          user: returnableUser,
          tokens: tokens
        }
      }
      return null
    } catch(err) {
      console.log('Validate user error ', err)
      return Promise.reject(new HttpException('Error while validating user', HttpStatus.UNAUTHORIZED))
    }
  }**/

  async validateUser(name: string, password: string) {
    try {
      const dbUser = await this.usersRepository.findOne({
        where: {
          username: name
        }
      })
      // User password in DB is encrypted
      const compareHash  = await bcrypt.compare(password, dbUser.password)
      console.log('Validating user ', dbUser, compareHash)
      if (dbUser && compareHash) {
        const { password, ...result } = dbUser;
        return result;
      }
      return null
    } catch(err) {
      console.log('Validate user error ', err)
      return Promise.reject(new HttpException('Error while validating user', HttpStatus.UNAUTHORIZED))
    }
  }

  async login(user: any) {
    try {
      const payload = { username: user.username, credential_level: user.credential_level, sub: user.id };
      return {
        tokens : {
          access_token: this.jwtService.sign({...payload, token_type: 'access'}, {expiresIn: '15m'}),
          refresh_token: this.jwtService.sign({...payload, token_type: 'refresh'}, {expiresIn: '1h'}),
        },
        user
      };
    } catch(err) {
      console.log('Validate user error ', err)
      return Promise.reject(new HttpException('Error while validating user', HttpStatus.UNAUTHORIZED))
    }
  }

  async refresh(user: any) {
    try {
      console.log('verifying token ', user)
      const payload = { username: user.username, credential_level: user.credential_level, sub: user.id };
      return {
        tokens : {
          access_token: this.jwtService.sign({...payload, token_type: 'access'}, {expiresIn: '15m'}),
          refresh_token: this.jwtService.sign({...payload, token_type: 'refresh'}, {expiresIn: '1h'}),
        },
        user
      };
    } catch(err) {
      console.log('Error verifying token ', err)
      return false
    }
  }

  async verify(token: string) {
    try {
      const payload = await this.jwtService.decode(token);
      const verified = await this.jwtService.verifyAsync(token);
      console.log('Users service verify ', payload, verified)
      return verified
    } catch(err) {
      console.log('Error verifying token ', err)
      return false
    }
  }

  async checkUser(username: string) {
    try {
      const user = await this.usersRepository.find({
        where: {
          name: username
        }
      })
      if (user.length !== 0) {
        return true
      } else {
        return false
      }
    } catch(err) {
      return Promise.reject(new HttpException('Error checking for user', HttpStatus.BAD_REQUEST))
    }
  }
  
  async getUsers() {
    try {
      // Return all users except root user (id 1)
      return await this.usersRepository.find({
        where: {
          id: Not(1)
        }
      })
    } catch(err) {
      return Promise.reject(new HttpException('Error getting users', HttpStatus.BAD_REQUEST))
    }
  }

  async createUser(username: string, password: string, credential_level: string) {
    try {
      console.log('Creating user', username, password, credential_level)
      const hashedPassword = await bcrypt.genSalt(10).then(async (salt) => {
        return await bcrypt.hash(password, salt)
      })
      console.log('Creating user hashed pword ', hashedPassword)

      const newUser = new Users()
      newUser.credential_level = credential_level;
      newUser.username = username;
      newUser.password = hashedPassword
      console.log('created new user ', newUser)

      const response =  await this.usersRepository.insert(newUser)
      console.log('Inserted into DB new user ', response)
      return response;
    } catch(err) {
      return Promise.reject(new HttpException('Error creating new user', HttpStatus.BAD_REQUEST))
    }
  }

  async updateUser(username: string, password: string | null, credential_level: string) {
    try {
      // No password change detected in request
      if (!password) {
      const response = await this.usersRepository.update({
          username: username
        }, {
          credential_level: credential_level
        })
        return response;
      } else {
        const hashedPassword = await bcrypt.genSalt(10).then(async (salt) => {
          return await bcrypt.hash(password, salt)
        })
        const response = await this.usersRepository.update({
            username: username
          }, {
            credential_level: credential_level,
            password: hashedPassword
          }
        )
        return response;
      }
    } catch(err) {
      return Promise.reject(new HttpException('Error updating user', HttpStatus.BAD_REQUEST))
    }
  }

  async removeUser(username: string) {
    try {
      return await this.usersRepository.delete({
        username: username
      })
    } catch(err) {
      return Promise.reject(new HttpException('Error removing user', HttpStatus.BAD_REQUEST))
    }
  }
}

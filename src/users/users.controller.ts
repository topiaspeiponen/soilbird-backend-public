import { JwtService } from '@nestjs/jwt';
import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Query, UseGuards, Request, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {UsersGuard} from './users.guard';
import {Roles} from 'src/roles.decorator';
import {AuthGuard} from '@nestjs/passport';
import {LocalAuthGuard} from './local-auth.guard';
import {JwtAuthGuard} from './jwt-auth-guard';
import {Tokens} from 'src/tokens.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
    ) {}
  
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.usersService.login(req.user);
  }

  @UseGuards(JwtAuthGuard, UsersGuard)
  @Roles('worker')
  @Tokens('refresh')
  @Get('auth/refresh')
  async refresh(
    @Request() req
  ) {
    return this.usersService.refresh(req.user)
  }

  
  @Get('auth/verify')
  async verify(
    @Query('token') token: string
  ) {
    return this.usersService.verify(token)
  }

  @UseGuards(JwtAuthGuard, UsersGuard)
  @Roles('worker')
  @Tokens('access')
  @Get('check')
  checkUser(
    @Query('username') username: string
  ) {
    return this.usersService.checkUser(username);
  }
  
  @UseGuards(JwtAuthGuard, UsersGuard)
  @Roles('admin')
  @Tokens('access')
  @Get('all')
  getUsers() {
    return this.usersService.getUsers()
  }

  @UseGuards(JwtAuthGuard, UsersGuard)
  @Roles('admin')
  @Tokens('access')
  @Post('create')
  createUser(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('credential_level') credential_level: string
  ) {
    return this.usersService.createUser(username, password, credential_level)
  }

  @UseGuards(JwtAuthGuard, UsersGuard)
  @Roles('admin')
  @Tokens('access')
  @Put('update')
  updateUser(
    @Body('username') username: string,
    @Body('password') password: string | null,
    @Body('credential_level') credential_level: string
  ) {
    return this.usersService.updateUser(username, password, credential_level)
  }

  @UseGuards(JwtAuthGuard, UsersGuard)
  @Roles('admin')
  @Tokens('access')
  @Delete('remove')
  removeUser(
    @Query('username') username: string
  ) {
    return this.usersService.removeUser(username);
  }

}

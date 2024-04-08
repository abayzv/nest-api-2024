import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { WebResponse } from '../model/web.model';
import { LoginUserRequest, RegisterUserRequest, UserResponse } from '../model/user.model';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';

@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @HttpCode(200)
  async register(
    @Body() request: RegisterUserRequest
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.register(request);
    return {
      message: 'User registered successfully',
      data: result,
    }
  }

  @Post('/login')
  @HttpCode(200)
  async login(
    @Body() request: LoginUserRequest
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.login(request);

    return {
      message: 'User logged in successfully',
      data: result,
    }
  }

  @Get('/me')
  @HttpCode(200)
  async get(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.get(user);

    return {
      message: 'Success',
      data: result,
    }
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { WebResponse } from '../model/web.model';
import { RegisterUserRequest, UserResponse } from '../model/user.model';

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
}

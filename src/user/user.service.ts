import { HttpException, Inject, Injectable } from '@nestjs/common';
import { LoginUserRequest, RegisterUserRequest, UserResponse } from '../model/user.model';
import { ValidationService } from '../common/validation.service'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService
  ) { }

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`Registering user with email ${JSON.stringify(request)}`);

    const registerUser = this.validationService.validate(
      UserValidation.REGISTER,
      request
    )

    const isUsernameExists = await this.prismaService.user.findFirst({
      where: {
        username: registerUser.username
      }
    })

    const isEmailExists = await this.prismaService.profile.findFirst({
      where: {
        email: registerUser.email
      }
    })

    if (isUsernameExists || isEmailExists) {
      throw new HttpException('Username already exists', 400)
    }

    const hashedPassword = await bcrypt.hash(registerUser.password, 10)

    const user = await this.prismaService.user.create({
      data: {
        username: registerUser.username,
        password: hashedPassword,
        profile: {
          create: {
            email: registerUser.email,
            first_name: registerUser.firstName,
            last_name: registerUser.lastName
          }
        }
      }
    })

    return {
      id: user.Id,
      username: user.username
    }
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.info(`Logging in user with email ${JSON.stringify(request)}`);

    const loginUser = this.validationService.validate(
      UserValidation.LOGIN,
      request
    )

    const user = await this.prismaService.user.findFirst({
      where: {
        username: loginUser.username
      },
      include: {
        profile: true
      }
    })

    if (!user) {
      throw new HttpException('Invalid username or password', 400)
    }

    const isPasswordMatch = await bcrypt.compare(loginUser.password, user.password)

    if (!isPasswordMatch) {
      throw new HttpException('Invalid username or password', 400)
    }

    const token = uuid()

    await this.prismaService.user.update({
      where: {
        Id: user.Id
      },
      data: {
        token: token
      }
    })

    return {
      id: user.Id,
      username: user.username,
      fullName: `${user.profile.first_name} ${user.profile.last_name}`,
      token: token
    }
  }

  async get(user: User): Promise<UserResponse> {

    if (!user) {
      throw new HttpException('Unauthorized', 401)
    }

    const userData = await this.prismaService.user.findUnique({
      where: {
        Id: user.Id
      },
      include: {
        profile: true
      }
    })

    return {
      id: userData.Id,
      username: userData.username,
      fullName: `${userData.profile.first_name} ${userData.profile.last_name}`,
    }
  }
}

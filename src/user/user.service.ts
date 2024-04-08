import { HttpException, Inject, Injectable } from '@nestjs/common';
import { RegisterUserRequest, UserResponse } from '../model/user.model';
import { ValidationService } from '../common/validation.service'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';

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
}

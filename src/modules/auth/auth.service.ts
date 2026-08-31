import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  EmailProducer,
  redis,
  redisKeys,
  TokenServices,
  TwoFAService,
  qualifyAge,
  CryptoService,
  HashingService,
  UserRepository,
} from 'src/common';
import { Request, Response } from 'express';
import { emailType, Sys_Role } from 'src/common/enums';
import { UserMapper } from './entities/user.mapper';
import {
  LoginDto,
  TwoFADto,
  ConfirmEmailDto,
  ResendOTPDto,
  SignupDto,
} from './Dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly crypto: CryptoService,
    private readonly hashService: HashingService,
    private readonly tokenServices: TokenServices,
    private readonly twoFAService: TwoFAService,
    private readonly emailQueue: EmailProducer,
  ) {}

  SignUp = async (data: SignupDto) => {
    const checkEmail = await this.userRepo.findByEmail(data.email);
    if (checkEmail) throw new ConflictException(`email is already exist`);
    const checkAge = qualifyAge(data.date_birth);
    if (!checkAge) throw new BadRequestException(`age must be greater than 18`);
    data.phone = this.crypto.encryption(data.phone);
    const userCreated = await this.userRepo.create({ ...data });
    await this.emailQueue.sendEmailJob(
      emailType.confirmation,
      userCreated.email,
    );
    return {
      message: 'signup successfully',
      data: {
        user: UserMapper.toCreateEntity(userCreated),
      },
    };
  };

  ConfirmEmail = async (Dto: ConfirmEmailDto) => {
    const User = await this.userRepo.findByEmail(Dto.email);
    if (!User) throw new NotFoundException(`user not found`);
    const savedOTP = await redis.get(redisKeys.OTP(Dto.email));
    if (!savedOTP) {
      throw new BadRequestException(`expire OTP`);
    }
    const isMAtch = this.hashService.compare_hash(Dto.OTP, savedOTP);
    if (!isMAtch) throw new BadRequestException(`invalid OTP`);
    User.isConfirmed = true;
    await redis.del(redisKeys.OTP(Dto.email));
    await this.userRepo.updateOne({ id: User.id }, { isConfirmed: true });
    return { message: `email is confirmed ` };
  };

  resendOTP = async (Dto: ResendOTPDto) => {
    const email: string = Dto.email;
    const User = await this.userRepo.findOne({
      email: email,
      isConfirmed: false,
    });
    if (!User) throw new NotFoundException(`email not found or confirmed`);
    await this.emailQueue.sendEmailJob(emailType.confirmation, email);
    return { message: 'OTP send' };
  };

  loginUser = async (Dto: LoginDto, res: Response) => {
    const { email, password } = Dto;
    const user = await this.userRepo.findByEmail(email, {
      select: { id: true, isBanned: true, isConfirmed:true,password: true, isTwoFA: true },
    });
    if (!user) throw new NotFoundException(`email not found`);
    if (!user.isConfirmed) {
      throw new BadRequestException(
        `email not verified please verify email first`,
      );
    }
    if (user.isBanned) {
      throw new BadRequestException(
        'your account has banned please contact the support team',
      );
    }
    const passMatch = await this.hashService.compare_hash(
      password,
      user?.password as string,
    );
    if (!passMatch) throw new BadRequestException(`invalid Password or email`);
    if (user.isTwoFA)
      return { message: `please enter 2FA code`, data: { id: user.id } };
    const { accessToken } = await this.tokenServices.generateTokens(
      {
        id: user.id,
        role: (user.role as Sys_Role) || Sys_Role.User,
        name: user.name,
      },
      res,
    );
    return { message: 'Login successfully', data: { accessToken } };
  };
  TwoFAlogin = async (data: TwoFADto, res: Response) => {
    const user = await this.userRepo.findById(data.id, {
      select: {
        secret: true,
        id: true,
        name: true,
        role: true,
        isBanned: true,
      },
    });
    if (!user) throw new NotFoundException('user not found');
    if (user.isBanned)
      throw new NotFoundException(
        'your account has banned please contact the support team',
      );
    const secret = this.crypto.decryption(user.secret);
    const isVerified = await this.twoFAService.verifyCode(data.code, secret);
    if (!isVerified) throw new BadRequestException('invalid code');
    const { accessToken } = await this.tokenServices.generateTokens(
      {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      res,
    );
    return { message: 'Login successfully', data: { accessToken } };
  };

  refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) throw new UnauthorizedException();
    const decoded = this.tokenServices.VerifyRefreshToken(token);
    const isExisted = await redis.getdel(
      redisKeys.refreshToken(decoded.id, decoded?.jti),
    );
    if (!isExisted) {
      throw new ForbiddenException();
    }
    const { accessToken } = await this.tokenServices.generateTokens(
      {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name,
      },
      res,
    );
    return { message: 'accessToken', data: { accessToken } };
  };
}

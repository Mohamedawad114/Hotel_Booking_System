import { plainToInstance } from 'class-transformer';
import { IUser } from 'src/common/interfaces';
import { userProfileEntity } from './userProfile.entity';

export class UserMapper {
  static toCreateEntity(user: IUser): userProfileEntity {
    return plainToInstance(userProfileEntity, user, {
      excludeExtraneousValues: true,
    });
  }
}

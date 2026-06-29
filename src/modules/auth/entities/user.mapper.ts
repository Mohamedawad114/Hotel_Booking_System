import { plainToInstance } from "class-transformer";
import { userCreateEntity } from "./user.entity";
import { IUser } from "src/common/interfaces";

export class UserMapper {
  static toCreateEntity(user: IUser): userCreateEntity {
    return plainToInstance(userCreateEntity, user, {
      excludeExtraneousValues: true,
    });
  }
}

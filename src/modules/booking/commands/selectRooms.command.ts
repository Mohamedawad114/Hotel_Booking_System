import { IRoomSelection, ISessionData } from 'src/common/interfaces';

export class SelectRoomsCommand {
  constructor(
    public readonly data: ISessionData,
    public readonly userId: number,
    public readonly hotelId: number,
  ) {}
}

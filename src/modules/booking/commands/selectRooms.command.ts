import { ISessionData } from "src/common/interfaces/roomSelect.interface";

export class SelectRoomsCommand {
  constructor(
    public readonly data: ISessionData,
    public readonly userId: number,
    public readonly hotelId: number,
  ) {}
}

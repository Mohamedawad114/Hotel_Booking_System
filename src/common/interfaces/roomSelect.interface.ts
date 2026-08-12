export interface IRoomSelection {
  rateKey: string;
  roomCode: string;
  roomId: number;
  adults: number;
  children: number;
}
export interface ISessionData {
  checkIn: Date;
  checkOut: Date;
  rooms: IRoomSelection[];
}

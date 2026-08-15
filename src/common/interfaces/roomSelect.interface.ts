export interface IRoomSelection {
  rateKey: string;
  roomCode: string;
  adults: number;
  children: number;
}
export interface ISessionData {
  checkIn: Date;
  checkOut: Date;
  rooms: IRoomSelection[];
}

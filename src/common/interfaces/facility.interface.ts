export interface IFacility {
  id?: number;
  code: number;
  groupCode: number;
  name: string;
}
export interface IHotelFacilities {
  id?: number;
  hotelId: number;
  facilityCode: number;
  order: number;
  indFee?: boolean;
  indLogic?: boolean;
  indYesOrNo?: boolean;
  voucher?: boolean;
  timeFrom: String;
  timeTo: String;
  number: number;
}
export interface IRoomFacilities {
  id: number;
  facilityCode: number;
  indFee?: Boolean;
  indLogic?: Boolean;
  voucher?: Boolean;
  roomId?: number;
  number: number;
}

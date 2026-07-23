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
  facilityGroupCode:number,
  order: number;
  indFee?: boolean;
  indLogic?: boolean;
  indYesOrNo?: boolean;
  voucher?: boolean;
  timeFrom?: string;
  timeTo?: string;
  number?: number;
}
export interface IRoomFacilities {
  id: number;
  facilityCode: number;
  indFee?: boolean;
  facilityGroupCode: number,
  hotelId:number,
  indLogic?: boolean;
  voucher?: boolean;
  roomCode: string;
  number?: number;
}

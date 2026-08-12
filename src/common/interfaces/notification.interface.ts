import { NotificationTitle } from "../enums";

export interface INotification{
    id?:number,
    title: NotificationTitle,
    content: string
    userId:number
}
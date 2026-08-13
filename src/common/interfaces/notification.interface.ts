import { NotificationTitle } from "../enums/notification.enum"

export interface INotification{
    _id?:number,
    title: NotificationTitle,
    content: string
    isRead:boolean
    userId:number
}
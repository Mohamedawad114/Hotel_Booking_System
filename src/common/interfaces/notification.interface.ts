import { NotificationTitle } from "../enums/notification.enum"

export interface INotification{
    id?:number,
    title: NotificationTitle,
    content: string
    isRead:boolean
    userId:number
}
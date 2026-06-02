import { DocumentData } from "firebase/firestore";
import { SWUser } from "./sw-user";

export class Walk {
  chatId: string;
  walkId: string;
  createdAt: Date;
  receiverId: string;
  senderId: string;
  scheduledDate: Date;
  receiverStartTime: Date;
  receiverEndTime: Date;
  senderStartTime: Date;
  senderEndTime: Date;
  otherWalker: SWUser | null;
  isOtherWalkerReceiver: boolean;

  constructor(
    chatId: string,
    walkId: string,
    createdAt: string,
    receiverId: string,
    senderId: string,
    scheduledDate: string,
    receiverStartTime: string,
    receiverEndTime: string,
    senderStartTime: string,
    senderEndTime: string,
    otherWalker: SWUser | null,
    isOtherWalkerReceiver: boolean,
  ) {
    this.chatId = chatId;
    this.walkId = walkId;
    this.createdAt = new Date(createdAt);
    this.receiverId = receiverId;
    this.senderId = senderId;
    this.scheduledDate = new Date(scheduledDate);
    this.receiverStartTime = new Date(receiverStartTime);
    this.receiverEndTime = new Date(receiverEndTime);
    this.senderStartTime = new Date(senderStartTime);
    this.senderEndTime = new Date(senderEndTime);
    this.otherWalker = otherWalker;
    this.isOtherWalkerReceiver = isOtherWalkerReceiver;
  }
}

export const WalkConverter = {
  fromFirestore: (
    data: DocumentData,
    otherWalker: SWUser | null,
    isOtherWalkerReceiver: boolean,
  ) => {
    let largerId, smallerId;
    if (data.senderId.localeCompare(data.receiverId) >= 0) {
      largerId = data.senderId;
      smallerId = data.receiverId;
    } else {
      largerId = data.receiverId;
      smallerId = data.senderId;
    }
    return new Walk(
      `${largerId}-${smallerId}`,
      data.id,
      data.createdAt,
      data.receiverId,
      data.senderId,
      data.walkDateTime,
      data.usersStartTime[data.receiverId],
      data.usersFinishTime[data.receiverId],
      data.usersStartTime[data.senderId],
      data.usersFinishTime[data.senderId],
      otherWalker,
      isOtherWalkerReceiver,
    );
  },
};

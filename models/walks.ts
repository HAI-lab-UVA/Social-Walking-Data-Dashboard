import { DocumentData } from "firebase/firestore";
import { SWUser } from "./sw-user";
import { Location, LocationConverter } from "./location";
import dayjs, { Dayjs } from "dayjs";

export class Walk {
  chatId: string;
  walkId: string;
  createdAt: Dayjs;
  receiverId: string;
  senderId: string;
  scheduledDate: Dayjs;
  receiverStartTime: Dayjs | null;
  receiverEndTime: Dayjs | null;
  senderStartTime: Dayjs | null;
  senderEndTime: Dayjs | null;
  receiverStartLocation: Location | null;
  receiverEndLocation: Location | null;
  senderStartLocation: Location | null;
  senderEndLocation: Location | null;
  otherWalker: SWUser | null;
  isOtherWalkerReceiver: boolean;

  constructor(
    chatId: string,
    walkId: string,
    createdAt: string,
    receiverId: string,
    senderId: string,
    scheduledDate: string,
    receiverStartTime: string | null,
    receiverEndTime: string | null,
    senderStartTime: string | null,
    senderEndTime: string | null,
    receiverStartLocation: Location | null,
    receiverEndLocation: Location | null,
    senderStartLocation: Location | null,
    senderEndLocation: Location | null,
    otherWalker: SWUser | null,
    isOtherWalkerReceiver: boolean,
  ) {
    this.chatId = chatId;
    this.walkId = walkId;
    this.createdAt = dayjs(createdAt);
    this.receiverId = receiverId;
    this.senderId = senderId;
    this.scheduledDate = dayjs(scheduledDate);
    this.receiverStartTime =
      receiverStartTime != null ? dayjs(receiverStartTime!) : null;
    this.receiverEndTime =
      receiverStartTime != null ? dayjs(receiverEndTime!) : null;
    this.senderStartTime =
      receiverStartTime != null ? dayjs(senderStartTime!) : null;
    this.senderEndTime =
      receiverStartTime != null ? dayjs(senderEndTime!) : null;
    this.receiverStartLocation = receiverStartLocation;
    this.receiverEndLocation = receiverEndLocation;
    this.senderStartLocation = senderStartLocation;
    this.senderEndLocation = senderEndLocation;
    this.otherWalker = otherWalker;
    this.isOtherWalkerReceiver = isOtherWalkerReceiver;
  }
}

export function formatDateTime(dateTime: Dayjs): string {
  return dateTime.format("ddd, MMM D, YYYY hh:mm:ss A");
}

export const WalkConverter = {
  fromFirestore: (
    data: DocumentData,
    otherWalker: SWUser | null,
    isOtherWalkerReceiver: boolean,
  ) => {
    // make chatId
    let largerId, smallerId;
    if (data.senderId > data.receiverId) {
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
      data.usersStartLocation[data.receiverId] != null
        ? LocationConverter.fromFirestore(
            data.usersStartLocation[data.receiverId],
          )
        : null,
      data.usersFinishLocation[data.receiverId] != null
        ? LocationConverter.fromFirestore(
            data.usersFinishLocation[data.receiverId],
          )
        : null,
      data.usersStartLocation[data.senderId] != null
        ? LocationConverter.fromFirestore(
            data.usersStartLocation[data.senderId],
          )
        : null,
      data.usersFinishLocation[data.senderId] != null
        ? LocationConverter.fromFirestore(
            data.usersFinishLocation[data.senderId],
          )
        : null,
      otherWalker,
      isOtherWalkerReceiver,
    );
  },
};

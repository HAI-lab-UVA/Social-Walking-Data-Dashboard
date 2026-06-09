"use client";
import {
  and,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  or,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { SWUser, SWUserConverter } from "@/models/sw-user";
import { WalkConverter } from "@/models/walks";
import { db } from "./firebase-config";
import { User } from "firebase/auth";
import { WalkDataLogConverter } from "@/models/walk-data-log";

export const getSWUser = async (user: User) => {
  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data()!;
    return SWUserConverter.fromFirestore(data);
  } else {
    throw new Error("User data does not exist");
  }
};

export const getUsersInStudy = async () => {
  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    where("group", "not-in", ["testing", "admin"]),
    orderBy("firstName"),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return SWUserConverter.fromFirestore(data);
  });
};

export const getFinishedWalksOfSelectedUser = async (
  selectedUser: SWUser,
  usersInStudy: SWUser[],
) => {
  const walksRef = collectionGroup(db, "cowalks");
  const qWalks = query(
    walksRef,
    and(
      where("status", "==", "accepted"),
      or(
        where("receiverId", "==", selectedUser.id),
        where("senderId", "==", selectedUser.id),
      ),
    ),
    orderBy("walkDateTime", "desc"),
  );
  const querySnapshotWalks = await getDocs(qWalks);

  return querySnapshotWalks.docs.map((doc) => {
    const data = doc.data();
    let otherWalker: SWUser | undefined;
    if (data.receiverId != selectedUser!.id) {
      otherWalker = usersInStudy.find((user) => {
        if (user.id == data.receiverId) {
          return user;
        }
      });
    } else {
      otherWalker = usersInStudy.find((user) => {
        if (user.id == data.senderId) {
          return user;
        }
      });
    }

    if (otherWalker == undefined) {
      return WalkConverter.fromFirestore(
        data,
        null,
        selectedUser!.id == data.senderId,
      );
    } else {
      return WalkConverter.fromFirestore(
        data,
        otherWalker,
        selectedUser!.id == data.senderId,
      );
    }
  });
};

export const getDataLogs = async (
  chatID: string,
  walkId: string,
  getReceiverDataLogs: boolean,
) => {
  let collectionName;
  if (getReceiverDataLogs) {
    collectionName = "receiverWalkDataLogs";
  } else {
    collectionName = "senderWalkDataLogs";
  }

  const ref = collection(
    db,
    "chats",
    chatID,
    "cowalks",
    walkId,
    collectionName,
  );
  const q = query(ref, orderBy("timestamp"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return WalkDataLogConverter.fromFirestore(data, doc.id);
  });
};

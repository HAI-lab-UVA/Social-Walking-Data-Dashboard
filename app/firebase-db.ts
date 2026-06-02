"use client";
import {
  and,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  or,
  query,
  where,
} from "firebase/firestore";

import { SWUser, SWUserConverter } from "@/models/sw-user";
import { WalkConverter } from "@/models/walks";
import { db } from "./firebase-config";
import { User } from "firebase/auth";

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
  const q = query(usersRef, where("group", "not-in", ["testing", "admin"]));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((doc) => {
      const data = doc.data();
      return SWUserConverter.fromFirestore(data);
    })
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
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
  );
  const querySnapshotWalks = await getDocs(qWalks);

  return querySnapshotWalks.docs
    .map((doc) => {
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
    })
    .sort((walk1, walk2) => {
      if (walk1.scheduledDate <= walk2.scheduledDate) {
        return 1;
      } else {
        return -1;
      }
    });
};

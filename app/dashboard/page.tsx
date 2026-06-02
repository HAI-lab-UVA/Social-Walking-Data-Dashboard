"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { SWUser } from "@/models/sw-user";
import { Walk } from "@/models/walks";
import { checkAuthAndReroute } from "../firebase-auth";
import {
  getFinishedWalksOfSelectedUser,
  getUsersInStudy,
} from "../firebase-db";

export default function LoginPage() {
  const router = useRouter();
  const [usersInStudy, setUsersInStudy] = useState<SWUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SWUser | null>(null);
  const [selectedUserWalks, setSelectedUserWalks] = useState<Walk[] | null>(
    null,
  );
  useEffect(() => {
    const checkAuth = async () => {
      await checkAuthAndReroute.ifNotAuthed("/login", router);
    };
    checkAuth();
  }, [router, usersInStudy, selectedUser, selectedUserWalks]);

  useEffect(() => {
    const updateUsersInStudy = async () => {
      const u = await getUsersInStudy();
      setUsersInStudy(u);
    };
    updateUsersInStudy();
  }, []);

  useEffect(() => {
    const updateSelectedUserWalks = async () => {
      const w = await getFinishedWalksOfSelectedUser(
        selectedUser!,
        usersInStudy,
      );
      setSelectedUserWalks(w);
    };
    if (selectedUser != null) {
      updateSelectedUserWalks();
    }
  }, [selectedUser, usersInStudy]);

  const onClickSelectUser = (user: SWUser) => {
    setSelectedUser(user);
  };

  return (
    <div className="flex w-full gap-8 p-3">
      <div className="flex flex-1 gap-2 flex-col align-top justify-top">
        {usersInStudy.map((user) => (
          <button
            onClick={() => onClickSelectUser(user)}
            className={
              selectedUser?.id == user.id
                ? "bg-violet-500 text-white py-2 px-4 rounded-full"
                : "bg-gray-600 hover:bg-violet-500 text-white py-2 px-4 rounded-full"
            }
            key={user.id}
          >
            {user.firstName} {user.lastName} ({user.id})
          </button>
        ))}
      </div>
      <div className="flex-2">
        <p className="text-violet-500">
          <b>NAME:</b> {selectedUser?.firstName} {selectedUser?.lastName}
        </p>
        <p className="text-violet-500">
          <b>ID:</b> {selectedUser?.id}
        </p>
        <p className="text-violet-500">
          <b>GROUP:</b> {selectedUser?.group}
        </p>
        <p className="text-2xl text-white">
          <b>TOTAL WALKS:</b> {selectedUserWalks?.length} (Latest:{" "}
          {selectedUserWalks?.at(0)?.createdAt.toDateString()}{" "}
          {selectedUserWalks?.at(0)?.createdAt.toLocaleTimeString()})
        </p>
        <p className="italic text-white">
          Walks are sorted newest to oldest scheduled date
        </p>
        <div className="flex flex-1 gap-2 flex-col align-top justify-top">
          {selectedUserWalks &&
            selectedUserWalks.map((walk) => (
              <div
                key={walk.walkId}
                className="bg-gray-200 text-black py-2 px-4 rounded-3xl"
              >
                <p className="text-emerald-600">
                  <b>Walk With:</b> {walk.otherWalker?.firstName}{" "}
                  {walk.otherWalker?.lastName} ({walk.otherWalker?.id})
                </p>
                <p>
                  <b>Chat ID:</b> {walk.chatId}
                </p>

                <p>
                  <b>Walk ID:</b> {walk.walkId}
                </p>
                <p>
                  <b>Created At:</b> {walk.createdAt.toDateString()}{" "}
                  {walk.createdAt.toLocaleTimeString()}
                </p>
                <p>
                  <b>Scheduled At:</b> {walk.scheduledDate.toDateString()}{" "}
                  {walk.scheduledDate.toLocaleTimeString()}
                </p>
                <p
                  className={
                    walk.isOtherWalkerReceiver
                      ? "text-emerald-600"
                      : "text-violet-500"
                  }
                >
                  <b>Receiver Start:</b> {walk.receiverStartTime.toDateString()}{" "}
                  {walk.receiverStartTime.toLocaleTimeString()}
                </p>
                <p
                  className={
                    walk.isOtherWalkerReceiver
                      ? "text-violet-500"
                      : "text-emerald-600"
                  }
                >
                  <b>Sender Start:</b> {walk.senderStartTime.toDateString()}{" "}
                  {walk.receiverStartTime.toLocaleTimeString()}
                </p>
                <p
                  className={
                    walk.isOtherWalkerReceiver
                      ? "text-emerald-600"
                      : "text-violet-500"
                  }
                >
                  <b>Receiver End:</b> {walk.receiverEndTime.toDateString()}{" "}
                  {walk.receiverEndTime.toLocaleTimeString()}
                </p>

                <p
                  className={
                    walk.isOtherWalkerReceiver
                      ? "text-violet-500"
                      : "text-emerald-600"
                  }
                >
                  <b>Sender End:</b> {walk.senderEndTime.toDateString()}{" "}
                  {walk.receiverEndTime.toLocaleTimeString()}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

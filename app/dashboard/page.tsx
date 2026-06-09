"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { SWUser } from "@/models/sw-user";
import { formatDateTime, Walk } from "@/models/walks";
import { checkAuthAndReroute } from "../firebase-auth";
import {
  getDataLogs,
  getFinishedWalksOfSelectedUser,
  getUsersInStudy,
} from "../firebase-db";
import { WalkDataLog } from "@/models/walk-data-log";
import { PathNode } from "@/models/path-node";
import dynamic from "next/dynamic";
import dayjs, { Dayjs } from "dayjs";
import minMax from "dayjs/plugin/minMax";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import duration from "dayjs/plugin/duration";
dayjs.extend(minMax);
dayjs.extend(isSameOrBefore);
dayjs.extend(duration);

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <p>Loading Map...</p>,
});

export default function DashboardPage() {
  const router = useRouter();

  const [usersInStudy, setUsersInStudy] = useState<SWUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SWUser | null>(null);
  const [selectedUserWalks, setSelectedUserWalks] = useState<Walk[] | null>(
    null,
  );
  const [selectedWalk, setSelectedWalk] = useState<Walk | null>(null);
  const [selectedReceiverDataLogs, setSelectedReceiverDataLogs] = useState<
    WalkDataLog[]
  >([]);
  const [selectedSenderDataLogs, setSelectedSenderDataLogs] = useState<
    WalkDataLog[]
  >([]);
  const [
    selectedReceiverCombinedPathNodes,
    setSelectedReceiverCombinedPathNodes,
  ] = useState<PathNode[]>([]);
  const [selectedSenderCombinedPathNodes, setSelectedSenderCombinedPathNodes] =
    useState<PathNode[]>([]);
  const [walkMinutesUpperBound, setWalkMinutesUpperBound] =
    useState<number>(1000);
  const [maxWalkMinutes, setMaxWalkMinutes] = useState<number>(1000);

  // check logged in
  useEffect(() => {
    const checkAuth = async () => {
      await checkAuthAndReroute.ifNotAuthed("/login", router);
    };
    checkAuth();
  }, [router, usersInStudy, selectedUser, selectedUserWalks]);

  // update users in study list on load
  useEffect(() => {
    const updateUsersInStudy = async () => {
      const u = await getUsersInStudy();
      setUsersInStudy(u);
    };
    updateUsersInStudy();
  }, []);

  // on selectedUser update
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
    setSelectedWalk(null);
  };

  // On selectedWalk update
  useEffect(() => {
    const updateSelectedWalk = async () => {
      // clear old data
      setSelectedReceiverCombinedPathNodes([]);
      setSelectedSenderCombinedPathNodes([]);

      const receiverDataLogs = await getDataLogs(
        selectedWalk!.chatId,
        selectedWalk!.walkId,
        true,
      );
      const senderDataLogs = await getDataLogs(
        selectedWalk!.chatId,
        selectedWalk!.walkId,
        false,
      );
      // Update receiver states
      setSelectedReceiverDataLogs(receiverDataLogs);
      const receiverCombinedPathNodes = combinePathNodes(receiverDataLogs);
      setSelectedReceiverCombinedPathNodes(receiverCombinedPathNodes);

      // Update sender states
      setSelectedSenderDataLogs(senderDataLogs);
      const senderCombinedPathNodes = combinePathNodes(senderDataLogs);
      setSelectedSenderCombinedPathNodes(senderCombinedPathNodes);

      // set mapDateUpperRange to the latest time

      const entireWalkTimeInMilliseconds = dayjs
        .max(
          receiverCombinedPathNodes[receiverCombinedPathNodes.length - 1]
            .timestamp,
          senderCombinedPathNodes[senderCombinedPathNodes.length - 1].timestamp,
        )

        .diff(
          dayjs.min(
            receiverCombinedPathNodes[0].timestamp,
            senderCombinedPathNodes[0].timestamp,
          ),
        );
      const entireWalkTimeInMinutes = Math.ceil(
        dayjs.duration(entireWalkTimeInMilliseconds).asMinutes(),
      );

      setWalkMinutesUpperBound(entireWalkTimeInMinutes);
      setMaxWalkMinutes(entireWalkTimeInMinutes);
    };

    const combinePathNodes = (dataLogs: WalkDataLog[]) => {
      let pathNodes: PathNode[] = [];
      dataLogs.forEach((v: WalkDataLog) => {
        pathNodes = pathNodes.concat(v.path);
      });

      // remove duplicate timestamps
      const pathNodesDupTimestampsRemoved: PathNode[] = [];
      pathNodes.forEach((n1: PathNode) => {
        if (pathNodesDupTimestampsRemoved.length == 0) {
          pathNodesDupTimestampsRemoved.push(n1);
        } else {
          const n2 = pathNodesDupTimestampsRemoved.at(-1);
          if (
            formatDateTime(n1.timestamp).localeCompare(
              formatDateTime(n2!.timestamp),
            ) != 0
          ) {
            pathNodesDupTimestampsRemoved.push(n1);
          }
        }
      });

      //sort
      const pathNodesSorted: PathNode[] = pathNodesDupTimestampsRemoved.sort(
        (v1, v2) => {
          if (v1.timestamp.isSameOrBefore(v2.timestamp)) {
            return -1;
          } else {
            return 1;
          }
        },
      );
      return pathNodesSorted;
    };

    if (selectedWalk != null) {
      updateSelectedWalk();
    }
  }, [selectedWalk]);

  const onClickSelectWalk = (walk: Walk) => {
    setSelectedWalk(walk);
  };

  const displayStudyUsersList = () => {
    return (
      <div className="flex gap-2 flex-col align-top justify-top">
        {usersInStudy.map((user) => (
          <button
            onClick={() => onClickSelectUser(user)}
            className={
              selectedUser?.id == user.id
                ? "bg-violet-500 text-white py-2 px-4 rounded-full select-text"
                : "bg-gray-200 hover:bg-violet-500 hover:text-white text-black py-2 px-2 rounded-full select-text"
            }
            key={user.id}
          >
            {user.firstName} {user.lastName} ({user.id})
          </button>
        ))}
      </div>
    );
  };

  const displaySelectedUser = () => {
    return (
      <div className="flex gap-2 flex-col align-top justify-top">
        <div className="text-violet-500">
          <p>
            <b>NAME:</b> {selectedUser?.firstName} {selectedUser?.lastName}
          </p>
          <p>
            <b>ID:</b> {selectedUser?.id}
          </p>
          <p>
            <b>GROUP:</b> {selectedUser?.group}
          </p>
        </div>
        {selectedUserWalks && (
          <div>
            <div className="text-2xl text-black">
              <b>Total Walks:</b> {selectedUserWalks.length}{" "}
              {selectedUserWalks.length > 0 && (
                <p>
                  <b>Latest Walk Created:</b>{" "}
                  {formatDateTime(selectedUserWalks[0].createdAt)}
                </p>
              )}
            </div>
            <p className="italic text-gray-700">
              Walks are sorted newest to oldest scheduled date.
            </p>
            <p className="italic text-gray-700">
              Click a walk to view more information.
            </p>
            <div className="flex flex-1 gap-2 flex-col align-top justify-top">
              {selectedUserWalks &&
                selectedUserWalks.map((walk) => (
                  <button
                    onClick={() => onClickSelectWalk(walk)}
                    className={
                      selectedWalk?.walkId == walk.walkId
                        ? "bg-amber-100 text-black py-2 px-4 rounded-3xl text-left select-text"
                        : "bg-gray-200 text-black py-2 px-4 rounded-3xl text-left select-text"
                    }
                    key={walk.walkId}
                  >
                    <p className="text-rose-500">
                      <b>Walk With:</b> {walk.otherWalker?.firstName}{" "}
                      {walk.otherWalker?.lastName} ({walk.otherWalker?.id})
                    </p>
                    <div>
                      <b>Chat ID:</b>{" "}
                      <span className="text-xs">{walk.chatId}</span>
                    </div>

                    <p>
                      <b>Walk ID:</b> {walk.walkId}
                    </p>
                    <p>
                      <b>Created At:</b> {formatDateTime(walk.createdAt)}
                    </p>
                    <p>
                      <b>Scheduled At:</b> {formatDateTime(walk.scheduledDate)}
                    </p>
                    <p
                      className={
                        walk.isOtherWalkerReceiver
                          ? "text-rose-500"
                          : "text-violet-500"
                      }
                    >
                      <b>Receiver Start:</b>{" "}
                      {walk.receiverStartTime != null
                        ? formatDateTime(walk.receiverStartTime!)
                        : "null"}
                    </p>
                    <p
                      className={
                        walk.isOtherWalkerReceiver
                          ? "text-violet-500"
                          : "text-rose-500"
                      }
                    >
                      <b>Sender Start:</b>{" "}
                      {walk.senderStartTime != null
                        ? formatDateTime(walk.senderStartTime!)
                        : "null"}
                    </p>
                    <p
                      className={
                        walk.isOtherWalkerReceiver
                          ? "text-rose-500"
                          : "text-violet-500"
                      }
                    >
                      <b>Receiver End:</b>{" "}
                      {walk.receiverEndTime != null
                        ? formatDateTime(walk.receiverEndTime!)
                        : "null"}
                    </p>

                    <p
                      className={
                        walk.isOtherWalkerReceiver
                          ? "text-violet-500"
                          : "text-rose-500"
                      }
                    >
                      <b>Sender End:</b>{" "}
                      {walk.senderEndTime != null
                        ? formatDateTime(walk.senderEndTime!)
                        : "null"}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const slicePathNodesToWalkMinutesUpperBound = (pathNodes: PathNode[]) => {
    if (
      selectedReceiverCombinedPathNodes.length <= 0 ||
      selectedSenderCombinedPathNodes.length <= 0
    ) {
      return pathNodes;
    } else {
      if (walkMinutesUpperBound == 0) {
        return [];
      } else {
        const mapDateUpperRange = dayjs
          .min(
            selectedReceiverCombinedPathNodes[0].timestamp,
            selectedSenderCombinedPathNodes[0].timestamp,
          )
          .add(walkMinutesUpperBound, "minute");

        console.log(
          `pathnodes min ${formatDateTime(pathNodes[0].timestamp)}, ${walkMinutesUpperBound}`,
        );
        console.log(
          `map date upper range ${formatDateTime(mapDateUpperRange)}`,
        );
        console.log(
          `pathnodes max ${formatDateTime(pathNodes[pathNodes.length - 1].timestamp)}`,
        );

        const upperIndex = pathNodes.findLastIndex((n) =>
          n.timestamp.isSameOrBefore(mapDateUpperRange),
        );
        return pathNodes.slice(0, upperIndex);
      }
    }
  };

  const displayWalkDataForOneUser = (
    pathNodes: PathNode[],
    dataLogs: WalkDataLog[],
    startTime: Dayjs,
    endTime: Dayjs,
  ) => {
    if (selectedWalk == null) {
      return;
    }

    const endDataLog = dataLogs.find((v) => v.action == "endWalk")!;
    const maxStepsFromPathNodes = pathNodes.reduce(function (prev, current) {
      return prev.steps > current.steps ? prev : current;
    });
    const maxStopwatchFromPathNodes = pathNodes.reduce(
      function (prev, current) {
        return prev.stopwatchSecs > current.stopwatchSecs ? prev : current;
      },
    );

    let stepsText, stopwatchText;
    if (endDataLog.finalSteps < maxStepsFromPathNodes.steps) {
      stepsText = (
        <p>
          <b>Steps:</b> {endDataLog.finalSteps} **conflicts with{" "}
          {maxStepsFromPathNodes.steps} steps at location point at{" "}
          {formatDateTime(maxStepsFromPathNodes.timestamp)}
        </p>
      );
    } else {
      stepsText = (
        <p>
          <b>Steps:</b> {endDataLog.finalSteps}
        </p>
      );
    }

    if (
      endDataLog.finalStopwatchSecs < maxStopwatchFromPathNodes.stopwatchSecs
    ) {
      stopwatchText = (
        <p>
          <b>Stopwatch:</b> {endDataLog!.finalStopwatchSecs} secs (
          {dayjs
            .duration(endDataLog!.finalStopwatchSecs, "second")
            .asMinutes()
            .toPrecision(3)}{" "}
          mins) **conflicts with {maxStepsFromPathNodes.stopwatchSecs} secs (
          {dayjs
            .duration(maxStepsFromPathNodes.stopwatchSecs, "second")
            .asMinutes()
            .toPrecision(3)}{" "}
          mins) at location point at{" "}
          {formatDateTime(maxStepsFromPathNodes.timestamp)}
        </p>
      );
    } else {
      stopwatchText = (
        <p>
          <b>Stopwatch:</b> {endDataLog!.finalStopwatchSecs} secs (
          {dayjs
            .duration(endDataLog!.finalStopwatchSecs, "second")
            .asMinutes()
            .toPrecision(3)}{" "}
          mins)
        </p>
      );
    }

    return (
      <div>
        <p>
          <b>Walk duration:</b>{" "}
          {dayjs.duration(endTime.diff(startTime)).asMinutes().toPrecision(3)}{" "}
          mins
        </p>
        {stopwatchText}
        {stepsText}
        <p>
          <b>Number of location points:</b> {pathNodes.length}
        </p>
      </div>
    );
  };

  const displaySelectedWalk = () => {
    const hasMapData =
      selectedReceiverCombinedPathNodes.length > 0 &&
      selectedSenderCombinedPathNodes.length > 0 &&
      selectedWalk;
    return (
      <div className="flex-1 gap-2 flex-col align-top justify-top">
        {hasMapData && (
          <div className="flex flex-col gap-2">
            <div>
              <p>Plot walk over time (in minutes): </p>
              0
              <input
                type="range"
                id="walkMinutes"
                min={0}
                max={maxWalkMinutes}
                step={1}
                value={walkMinutesUpperBound}
                onChange={(e) => {
                  setWalkMinutesUpperBound(e.target.valueAsNumber);
                }}
                className="width-full pl-8 pr-8"
              />
              {maxWalkMinutes}
            </div>
            <div className="italic">
              Start point: filled in white circle. End point: filled in black
              circle. Click on points to see details.
            </div>
            <div id="map">
              <LeafletMap
                receiverPathNodes={slicePathNodesToWalkMinutesUpperBound(
                  selectedReceiverCombinedPathNodes,
                )}
                senderPathNodes={slicePathNodesToWalkMinutesUpperBound(
                  selectedSenderCombinedPathNodes,
                )}
                receiverStart={selectedWalk.receiverStartLocation!}
                receiverEnd={selectedWalk.receiverEndLocation!}
                senderStart={selectedWalk.senderStartLocation!}
                senderEnd={selectedWalk.senderEndLocation!}
                walkId={selectedWalk.walkId}
                isOtherWalkerReceiver={selectedWalk.isOtherWalkerReceiver}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div
                className={
                  selectedWalk.isOtherWalkerReceiver
                    ? "text-rose-500"
                    : "text-violet-500"
                }
              >
                <p>
                  <b>
                    Receiver (
                    {selectedWalk.isOtherWalkerReceiver
                      ? `${selectedWalk.otherWalker?.firstName} ${selectedWalk.otherWalker?.lastName}`
                      : `${selectedUser?.firstName} ${selectedUser?.lastName}`}
                    )
                  </b>
                </p>
                {displayWalkDataForOneUser(
                  selectedReceiverCombinedPathNodes,
                  selectedReceiverDataLogs,
                  selectedWalk.receiverStartTime!,
                  selectedWalk.receiverEndTime!,
                )}
              </div>
              <div
                className={
                  selectedWalk.isOtherWalkerReceiver
                    ? "text-violet-500"
                    : "text-rose-500"
                }
              >
                <p>
                  <b>
                    Sender (
                    {!selectedWalk.isOtherWalkerReceiver
                      ? `${selectedWalk.otherWalker?.firstName} ${selectedWalk.otherWalker?.lastName}`
                      : `${selectedUser?.firstName} ${selectedUser?.lastName}`}
                    )
                  </b>
                </p>
                {displayWalkDataForOneUser(
                  selectedSenderCombinedPathNodes,
                  selectedSenderDataLogs,
                  selectedWalk.senderStartTime!,
                  selectedWalk.senderEndTime!,
                )}
              </div>
            </div>
            <div className="italic">
              Number of location points removes points recorded within the same
              second and does not include the start/end points
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex w-full gap-4 p-3">
      {displayStudyUsersList()}
      {selectedUser && displaySelectedUser()}
      {selectedWalk && displaySelectedWalk()}
    </div>
  );
}

import { DocumentData } from "firebase/firestore";
import { PathNode } from "./path-node";
import { Location } from "./location";
import dayjs, { Dayjs } from "dayjs";

export class WalkDataLog {
  docId: string;
  action: string;
  finalSteps: number;
  finalStopwatchSecs: number;
  path: PathNode[];
  timestamp: Dayjs;
  constructor(
    docId: string,
    action: string,
    finalSteps: number,
    finalStopwatchSecs: number,
    path: PathNode[],
    timestamp: string,
  ) {
    this.docId = docId;
    this.action = action;
    this.finalSteps = finalSteps;
    this.finalStopwatchSecs = finalStopwatchSecs;
    this.path = path;
    this.timestamp = dayjs(timestamp);
  }
}

export const WalkDataLogConverter = {
  fromFirestore: (data: DocumentData, docId: string) => {
    const pathAsArray = data.path as DocumentData[];
    const pathNodes = pathAsArray.map((p: DocumentData) => {
      const locationAsDocumentData = p.location as DocumentData;
      const location = new Location(
        locationAsDocumentData.latitude,
        locationAsDocumentData.longitude,
        locationAsDocumentData.timestamp,
        locationAsDocumentData.address,
      );
      return new PathNode(location, p.steps, p.stopwatchSeconds, p.timestamp);
    });

    return new WalkDataLog(
      docId,
      data.action,
      data.finalSteps,
      data.finalStopwatchSeconds,
      pathNodes,
      data.timestamp,
    );
  },
};

import { DocumentData } from "firebase/firestore";
import { Location, LocationConverter } from "./location";
import dayjs, { Dayjs } from "dayjs";

export class PathNode {
  location: Location;
  steps: number;
  stopwatchSecs: number;
  timestamp: Dayjs;

  constructor(
    location: Location,
    steps: number,
    stopwatchSecs: number,
    timestamp: string,
  ) {
    this.location = location;
    this.steps = steps;
    this.stopwatchSecs = stopwatchSecs;
    this.timestamp = dayjs(timestamp);
  }
}

export const PathNodeConverter = {
  fromFirestore: (data: DocumentData) => {
    const location = LocationConverter.fromFirestore(data.location);
    return new PathNode(
      location,
      data.steps,
      data.stopwatchSecs,
      data.timestamp,
    );
  },
};

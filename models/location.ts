import dayjs, { Dayjs } from "dayjs";
import { DocumentData } from "firebase/firestore";

export class Location {
  lat: number;
  lon: number;
  timestamp: Dayjs;
  address: string | null;

  constructor(
    lat: number,
    lon: number,
    timestamp: string,
    address: string | null,
  ) {
    this.lat = lat;
    this.lon = lon;
    this.timestamp = dayjs(timestamp);
    this.address = address;
  }

  getCoordinate() {
    return [this.lat, this.lon];
  }
}

export const LocationConverter = {
  fromFirestore: (data: DocumentData) => {
    return new Location(
      data.latitude,
      data.longitude,
      data.timestamp,
      data.address,
    );
  },
};

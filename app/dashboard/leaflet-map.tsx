"use client";
import { Location } from "@/models/location";
import { PathNode } from "@/models/path-node";
import { formatDateTime } from "@/models/walks";
import { Dayjs } from "dayjs";
import { LatLngTuple } from "leaflet";
import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";

interface MapProps {
  receiverPathNodes: PathNode[];
  senderPathNodes: PathNode[];
  receiverStart: Location;
  senderStart: Location;
  receiverEnd: Location;
  senderEnd: Location;
  walkId: string; // force map bound update on a new walk
  isOtherWalkerReceiver: boolean;
}

export default function LeafletMap(props: MapProps) {
  return (
    <MapContainer
      bounds={props.receiverPathNodes.map(
        (node) => node.location.getCoordinate() as LatLngTuple,
      )}
      zoom={30}
      scrollWheelZoom={true}
      style={{ height: "600px", width: "100%" }}
      key={props.walkId}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pathMarker(props.receiverPathNodes, true, props.isOtherWalkerReceiver)}
      {pathMarker(props.senderPathNodes, false, props.isOtherWalkerReceiver)}

      {startMarker(
        props.receiverStart.getCoordinate() as LatLngTuple,
        props.receiverStart.timestamp,
        true,
        props.isOtherWalkerReceiver,
      )}
      {startMarker(
        props.senderStart.getCoordinate() as LatLngTuple,
        props.senderStart.timestamp,
        false,
        props.isOtherWalkerReceiver,
      )}
      {endMarker(
        props.receiverEnd.getCoordinate() as LatLngTuple,
        props.receiverEnd.timestamp,
        true,
        props.isOtherWalkerReceiver,
      )}
      {endMarker(
        props.senderEnd.getCoordinate() as LatLngTuple,
        props.senderEnd.timestamp,
        false,
        props.isOtherWalkerReceiver,
      )}
    </MapContainer>
  );
}

function startMarker(
  center: LatLngTuple,
  time: Dayjs,
  isReceiver: boolean,
  isOtherWalkerReceiver: boolean,
) {
  return (
    <CircleMarker
      center={center}
      pathOptions={{
        color:
          (isReceiver && isOtherWalkerReceiver) ||
          (!isReceiver && !isOtherWalkerReceiver)
            ? "var(--color-rose-500)"
            : "var(--color-violet-500)",
        fillColor: "var(--color-white)",
        fillOpacity: 80,
      }}
      radius={5}
    >
      <Popup>
        <p>{isReceiver ? "Receiver" : "Sender"} Start</p>
        <p>{formatDateTime(time)}</p>
      </Popup>
    </CircleMarker>
  );
}

function endMarker(
  center: LatLngTuple,
  time: Dayjs,
  isReceiver: boolean,
  isOtherWalkerReceiver: boolean,
) {
  return (
    <CircleMarker
      center={center}
      pathOptions={{
        color:
          (isReceiver && isOtherWalkerReceiver) ||
          (!isReceiver && !isOtherWalkerReceiver)
            ? "var(--color-rose-500)"
            : "var(--color-violet-500)",
        fillColor: "var(--color-black)",
        fillOpacity: 80,
      }}
      radius={5}
    >
      <Popup>
        <p>{isReceiver ? "Receiver" : "Sender"} End</p>
        <p>{formatDateTime(time)}</p>
      </Popup>
    </CircleMarker>
  );
}

function pathMarker(
  pathNodes: PathNode[],
  isReceiver: boolean,
  isOtherWalkerReceiver: boolean,
) {
  return pathNodes.map((n) => (
    <CircleMarker
      center={n.location.getCoordinate() as LatLngTuple}
      pathOptions={{
        color:
          (isReceiver && isOtherWalkerReceiver) ||
          (!isReceiver && !isOtherWalkerReceiver)
            ? "var(--color-rose-500)"
            : "var(--color-violet-500)",
        fillColor:
          (isReceiver && isOtherWalkerReceiver) ||
          (!isReceiver && !isOtherWalkerReceiver)
            ? "var(--color-rose-500)"
            : "var(--color-violet-500)",
        fillOpacity: 100,
      }}
      radius={3}
      key={n.timestamp.toISOString()}
    >
      <Popup>
        <p>{formatDateTime(n.timestamp)}</p>
        <p>Steps: {n.steps}</p>
        <p>Stopwatch: {n.stopwatchSecs} secs</p>
      </Popup>
    </CircleMarker>
  ));
}

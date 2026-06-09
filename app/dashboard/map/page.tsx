"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("../leaflet-map"), {
  ssr: false,
  loading: () => <p>Loading Map...</p>,
});
export default function MapPage() {
  return (
    <div id="map">
      <LeafletMap />
    </div>
  );
}

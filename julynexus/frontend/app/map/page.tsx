import type { Metadata } from "next"

import { MapClient } from "./map-client"

export const metadata: Metadata = {
  title: "Map · JulyNexus",
  description: "Explore verified civic incidents and aid activity on the map.",
}

export default function MapPage() {
  return <MapClient />
}

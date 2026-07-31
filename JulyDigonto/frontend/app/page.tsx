import type { Metadata } from "next"

import { HomeClient } from "./home-client"
import { Nav } from "@/components/nav"

export const metadata: Metadata = {
  title: "JulyDigonto · জুলাই ৩৬ মেমোরিয়াল মিউজিয়াম",
  description:
    "The July Mass Uprising Memorial Museum has been established to document the 16 years of Fascist Hasina's tyranny and to commemorate the July Uprising for generations to come.",
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <HomeClient />
    </>
  )
}
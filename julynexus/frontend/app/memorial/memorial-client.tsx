"use client"

import { useEffect, useState } from "react"
import {
  Flame,
  Plus,
  Loader2,
  CheckCircle2,
  CircleAlert,
  MapPin,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MemorialClient() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="size-5 text-primary" />
          Memorial entries
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Memorial submissions will appear here once the backend is connected.
      </CardContent>
    </Card>
  )
}
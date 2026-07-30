"use client"

import { useCallback, useRef, useState } from "react"
import { UploadCloud, FileImage, FileVideo, X } from "lucide-react"

import { cn } from "@/lib/utils"

type UploadZoneProps = {
  accept: string
  maxSizeMB?: number
  onFile: (file: File) => void
  hint?: string
}

export function UploadZone({
  accept,
  maxSizeMB = 25,
  onFile,
  hint,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const acceptList = accept.split(",").map((t) => t.trim())

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const f = files[0]
      const maxBytes = maxSizeMB * 1024 * 1024
      if (f.size > maxBytes) {
        setError(`File too large (max ${maxSizeMB} MB).`)
        return
      }
      const ext = "." + (f.name.split(".").pop() ?? "").toLowerCase()
      if (
        acceptList.length > 0 &&
        !acceptList.includes(f.type) &&
        !acceptList.includes(ext) &&
        acceptList[0] !== "*"
      ) {
        setError(`Unsupported file type: ${f.type || ext}`)
        return
      }
      setError(null)
      setFile(f)
      onFile(f)
    },
    [acceptList, maxSizeMB, onFile],
  )

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/30 p-8 text-center transition-colors",
        dragOver && "border-primary bg-primary/5",
        error && "border-destructive",
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {file ? (
        <div className="flex items-center gap-3">
          {file.type.startsWith("video") ? (
            <FileVideo className="size-8 text-primary" />
          ) : (
            <FileImage className="size-8 text-primary" />
          )}
          <div className="text-left">
            <p className="text-sm font-semibold">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            className="ml-3 inline-flex size-7 items-center justify-center rounded-md border border-input hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation()
              setFile(null)
              setError(null)
            }}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <>
          <UploadCloud className="size-10 text-primary" />
          <p className="mt-3 text-sm font-medium">
            Drag &amp; drop, or click to upload
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {hint ?? accept}
          </p>
        </>
      )}
      {error && (
        <p className="mt-2 text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}

export function UploadProgress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${pct}%` }}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}
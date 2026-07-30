import { NextRequest, NextResponse } from "next/server"
import { execFile } from "child_process"
import { mkdtemp, readFile, readdir, rm, writeFile } from "fs/promises"
import { tmpdir } from "os"
import { join } from "path"
import { promisify } from "util"

const execFileAsync = promisify(execFile)

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  let workDir: string | null = null
  try {
    const form = await request.formData()
    const file = form.get("video")
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing video file (field name: video)." }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    if (buf.length > 80 * 1024 * 1024) {
      return NextResponse.json({ error: "Video too large (max ~80MB for demo)." }, { status: 400 })
    }

    workDir = await mkdtemp(join(tmpdir(), "trustsetu-vid-"))
    const name = file instanceof File && file.name ? file.name : "upload.mp4"
    const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "mp4"
    const inputPath = join(workDir, `input.${ext}`)
    await writeFile(inputPath, buf)

    const outPattern = join(workDir, "frame-%03d.png")
    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-vf",
      "fps=1,scale=640:-1",
      "-frames:v",
      "6",
      outPattern
    ])

    const names = (await readdir(workDir)).filter((n) => n.startsWith("frame-") && n.endsWith(".png")).sort()
    const frames: string[] = []
    for (const n of names.slice(0, 6)) {
      const b = await readFile(join(workDir, n))
      frames.push(`data:image/png;base64,${b.toString("base64")}`)
    }

    if (!frames.length) {
      return NextResponse.json(
        { error: "No frames extracted. Ensure ffmpeg is installed and the file is a valid video." },
        { status: 500 }
      )
    }

    return NextResponse.json({ frames, count: frames.length })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Frame extraction failed"
    return NextResponse.json(
      {
        error: `${msg}. Install ffmpeg (https://ffmpeg.org) and add it to PATH.`
      },
      { status: 500 }
    )
  } finally {
    if (workDir) {
      try {
        await rm(workDir, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
  }
}

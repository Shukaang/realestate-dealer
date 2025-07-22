import { NextResponse } from "next/server"
import * as path from "path"
import * as fs from "fs"

export async function GET() {
  try {
    const serviceAccountPath = process.env.FIREBASE_ADMIN_CREDENTIALS_PATH
    const resolvedPath = path.resolve(process.cwd(), serviceAccountPath || "")
    
    return NextResponse.json({
      serviceAccountPath,
      resolvedPath,
      fileExists: fs.existsSync(resolvedPath),
      currentWorkingDirectory: process.cwd(),
      environmentVariables: {
        FIREBASE_ADMIN_CREDENTIALS_PATH: process.env.FIREBASE_ADMIN_CREDENTIALS_PATH,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
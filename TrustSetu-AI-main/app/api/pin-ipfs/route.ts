import { NextRequest, NextResponse } from "next/server";
import { pinFileToIPFS, getPinataGatewayUrl } from "@/lib/pinata";

export const maxDuration = 300; // 5 minutes for large file uploads

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type (optional)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not supported" },
        { status: 400 }
      );
    }

    // Pin file to IPFS
    const ipfsHash = await pinFileToIPFS(file);
    const gatewayUrl = getPinataGatewayUrl(ipfsHash);

    return NextResponse.json({
      success: true,
      ipfsHash,
      gatewayUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
  } catch (error: any) {
    console.error("Error in IPFS pinning:", error);
    return NextResponse.json(
      { error: "Failed to pin file to IPFS", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ipfsHash = searchParams.get("hash");

    if (!ipfsHash) {
      return NextResponse.json(
        { error: "IPFS hash is required" },
        { status: 400 }
      );
    }

    const gatewayUrl = getPinataGatewayUrl(ipfsHash);

    return NextResponse.json({
      success: true,
      ipfsHash,
      gatewayUrl
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to retrieve IPFS gateway URL", details: error.message },
      { status: 500 }
    );
  }
}
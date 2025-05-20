/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(
  req: Request,
  { params }: { params: { endpoint: string } }
) {
  const data = await req.formData();
  const file = data.get("file") as File;

  if (!file) {
    return new NextResponse("No file found", { status: 400 });
  }

  try {
    // Upload to UploadThing
    const response = await utapi.uploadFiles(file);
    if (!response.data?.ufsUrl) {
      throw new Error("Upload failed");
    }

    return NextResponse.json({ 
      url: response.data.ufsUrl,
      name: file.name,
      size: file.size
    });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
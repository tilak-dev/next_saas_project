import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";

interface cloudinaryUploadResult {
  public_id: string;
  [key: string]: any;
}
export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }
    //learn how to upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<cloudinaryUploadResult>(
      (resolve, rejects) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "next-upload-videos" },
          (error, result) => {
            if (error) rejects(error);
            else resolve(result as cloudinaryUploadResult);
          }
        );
        uploadStream.end(buffer);
      }
    );
    return NextResponse.json(
      { message: "File uploaded successfully", 
        public_id: result.public_id },
      { status: 200 }
    );
  } catch (error) {
    console.log("upload images error", error)
    return NextResponse.json({ message: "Error in uploading", error: error }, { status: 500 });
  }
}

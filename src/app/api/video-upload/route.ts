import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client/extension";

const prisma = new PrismaClient();

interface cloudinaryUploadResult {
  public_id: string;
  bytes: number;
  duration?: number;
  [key: string]: any;
}
export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
//do this in images ones
 
    try {
      if (
        !process.env.NEXT_PUBLCLOUDINARY_API_KEYIC_CLOUDINARY_CLOUD_NAME ||
        process.env.CLOUDINARY_API_KEY ||
        process.env.CLOUDINARY_API_SECRET
      ){
        return NextResponse.json({ error: "Cloudinary config not found" }, { status: 500 });
      }
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const title = formData.get("title") as string
      const description = formData.get("description") as string;
      const originalSize = formData.get("originalSize") as string

      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 400 });
      }
      //learn how to upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise<cloudinaryUploadResult>(
        (resolve, rejects) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type:"video",
               folder: "next-upload-video",
               transformation: [{ quality : "auto", fetch_format :"mp4"}]
              },
            (error, result) => {
              if (error) rejects(error);
              else resolve(result as cloudinaryUploadResult);
            }
          );
          uploadStream.end(buffer);
        }
      );
     const video = await prisma.video.create({
      title,
      description,
      originalSize,
      publicId: result.public_id,
      compressSize: String(result.bytes),
      duration :result.duration
     })

     return NextResponse.json(video)
    } catch (error) {
      console.log("upload video error", error);
      return NextResponse.json(
        { message: "Error in uploading video", error: error },
        { status: 500 }
      );
    }finally{
      await prisma.$disconnect();
    }
}

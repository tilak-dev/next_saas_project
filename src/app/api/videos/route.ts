import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
    });
    if(videos.length === 0) {
      return NextResponse.json({ message: "No videos found" }, { status: 200 });
    }
    return NextResponse.json(videos);
  } catch (error) {
    console.log("error in fetching videos",error); 
    return NextResponse.json({ message: "error in videos",error:error }, { status: 500 });
  }finally{
    await prisma.$disconnect();
  }
}

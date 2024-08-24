"use client";

import React,{useEffect,useCallback, useState} from 'react'
import axios from 'axios'
import VideoCard from '@/components/VideoCard'
import { Video } from '@/types'

function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading,setLoading] = useState(false)
  const [error , setErroe] = useState<null | string>(null)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get("api/videos")
      if(Array.isArray(response)){
        setVideos(response.data)
      }else{
        throw new Error("unable to get videos")
      } 
    } catch (error) {
      console.error(error)
      setErroe(error as string)
    } finally{
       setLoading(false)
    }
  },[])

  useEffect(()=>{
    fetchVideos()
  },[fetchVideos])

  const handelOnDownload = useCallback((url:string, title:string)=>{
    // implement download logic here
    console.log("Download",url,title)
    // call your backend service for download
    const link = document.createElement("a")
      link.href = url
      link.setAttribute("download",`${title}.mp4`)
      link.setAttribute("target", "_blank")
      document.body.appendChild(link)
      link.click();
      document.body.removeChild(link)
  },[])

  if(loading){
    return <div>loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Videos</h1>
      {videos.length === 0 ? (
        <div className="text-center text-lg text-gray-500">
          No videos available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {
            videos.map((video)=>(
              <VideoCard 
              video={video}
              onDownload={handelOnDownload}
              key={video.id}
              />
            ))
          }
        </div>
      )}
    </div>
  );
}

export default Home
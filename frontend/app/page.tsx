'use client'
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [camera, setCamera] = useState<Boolean>(true)
  const video = useRef<HTMLVideoElement>(null)
  useEffect(()=>{
    const startCamera = async()=>{
      try{
        const stream = await navigator.mediaDevices.getUserMedia({
          video:true,
          audio:false
        })
        if (video.current){
          video.current.srcObject = stream
        }
      }catch(err:unknown){
        let message = "Something went wrong"
        if (err instanceof Error){
         message = err.message
        } 
        console.error(message);
      }
    }
    if (camera){
      startCamera()
    }
    return ()=>{
      if (video.current && video.current.srcObject){
        const stream = video.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach(element => {
          element.stop()
        });
      }
    }
  },[camera])
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-zinc-50 font-sans py-10 space-y-4">
      <div className="absolute max-h-1/12 inset-0 w-full flex items-start justify-center py-24 px-16 bg-linear-to-r from-blue-600 to-blue-300 sm:items-start">
      </div>
      <h1 className="font-bold text-center sm:text-2xl md:text-4xl lg:text-5xl z-10">Emotion Detect</h1>
      <div className="flex flex-row items-center justify-between max-h-11/12 w-full py-6 px-24 z-10">
        <div className="h-full w-4/12 py-8 px-8 border-2 rounded-2xl bg-white flex flex-col items-center">
          <h2 className="text-center font-bold text-3xl text-gray-600">IMAGE INPUT</h2>
          <div className="flex flex-row justify-center space-x-4 items-center py-8">
            <button className={`border-b-2 ${camera ? "text-blue-500 border-blue-500":"text-gray-500 border-transparent hover:text-gray-700"} font-bold transition duration-200`} onClick={()=>setCamera(true)}>Use Camera</button>
            <button className={`border-b-2 ${!camera ? "text-blue-500 border-blue-500":"text-gray-500 border-transparent hover:text-gray-700"} font-bold transition duration-200`} onClick={()=>setCamera(false)}>Upload File</button>
          </div>
          {camera ?
          <video
            ref={video}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]" 
          />:
          <div>

          </div>
          }
          
          <button className="  text-center font-bold text-lg bg-blue-500 border-2 rounded-lg px-2 py-4 w-full transition duration-200 hover:bg-blue-300 hover:text-gray-500">{camera ? "Capture Photo":"Upload File"}</button>
        </div>
        <div className=" max-h-full">

        </div>
      </div>
    </div>
  );
}

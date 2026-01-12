'use client'
import { useEffect, useRef, useState } from "react";

const emotion = {
    0:"Angry",
    1:"Disgust",
    2:"Fear",
    3:"Happy",
    4:"Sad",
    5:"Surprise",
    6:"Neutral"
}

export default function Home() {
  const [camera, setCamera] = useState<Boolean>(true)
  const video = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const inputHTMLFileRef = useRef<HTMLInputElement>(null)
  const [emotion, setEmotion] = useState<number[]>([0.7,0,5,0.3,0.4,0.5,0.6,0.7])
  useEffect(()=>{
    const startCamera = async()=>{
      try{
        const stream = await navigator.mediaDevices.getUserMedia({
          video:true,
          audio:false
        })
        streamRef.current = stream
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
    }else{
      return ()=>{
        stopCamera()
      }
    }
    return ()=>{
      stopCamera()
    }
  },[camera])
  const stopCamera = ()=>{
    if (streamRef.current){
      const tracks = streamRef.current.getTracks()
      tracks.forEach(element=>element.stop())
      streamRef.current = null
    }
  }
  const captureImage = ()=>{
    if (!video.current){return}
    const canvas = document.createElement("canvas")
    canvas.width = video.current.videoWidth
    canvas.height = video.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx){
      // mirror the image
      ctx.translate(canvas.width,0)
      ctx.scale(-1,1)
      ctx.drawImage(video.current,0,0)
      canvas.toBlob((blob)=>{
        if (blob){
          const file = new File([blob], "capture.jpg", {type:"image/jpeg"})
          setFile(file)
          console.log("Ready to sent");
        }
      },'image/jpeg')
    }else{
      console.error("Failed to create context");
      
    }
  }
  const handleMainClick = ()=>{
    if (camera){
      captureImage()
    }else{
      inputHTMLFileRef.current?.click()
    }
  }
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-zinc-50 font-sans py-10 space-y-4">
      <div className="absolute max-h-1/12 inset-0 w-full flex items-start justify-center py-24 px-16 bg-linear-to-r from-blue-600 to-blue-300 sm:items-start">
      </div>
      <h1 className="font-bold text-center sm:text-2xl md:text-4xl lg:text-5xl z-10">Emotion Detect</h1>
      <div className="flex flex-row items-start justify-between h-11/12 w-full py-6 px-24 z-10 space-x-5">
        <div className="h-full w-4/12 py-8 px-8 border-2 rounded-2xl bg-white flex flex-col items-center">
          <h2 className="text-center font-bold text-3xl text-gray-600">IMAGE INPUT</h2>
          <div className="flex flex-row justify-center space-x-4 items-center py-8">
            <button className={`border-b-2 ${camera ? "text-blue-500 border-blue-500":"text-gray-500 border-transparent hover:text-gray-700"} font-bold transition duration-200`} onClick={()=>setCamera(true)}>Use Camera</button>
            <button className={`border-b-2 ${!camera ? "text-blue-500 border-blue-500":"text-gray-500 border-transparent hover:text-gray-700"} font-bold transition duration-200`} onClick={()=>setCamera(false)}>Upload File</button>
          </div>
          <div className="w-40 h-40 md:w-80 md:h-60 lg:w-100 lg:h-80 object-cover">
            {camera ?
            <video
              ref={video}
              autoPlay
              playsInline
              muted
              className="w-full h-full transform scale-x-[-1]" 
            />: 
            <div className="w-full h-full flex flex-col justify-center items-center">
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept="image/*" 
                ref={inputHTMLFileRef}
                onChange={(e)=>{
                  if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
                }}
              />
              <label htmlFor="file-upload" className="text-center font-semibold text-gray-600 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                อัปโหลดรูปภาพ
              </label>
            </div>
            }
          </div>
          <button className="  text-center font-bold text-lg bg-blue-500 border-2 rounded-lg px-2 py-4 w-full transition duration-200 hover:bg-blue-300 hover:text-gray-500"
          onClick={handleMainClick}>
            {camera ? "Capture Photo":"Upload File"}
          </button>
        </div>
        <div className="h-full w-8/12 py-8 px-8 border-2 rounded-2xl bg-white flex flex-col items-center">
            <h2 className=" font-bold text-center text-3xl text-gray-600">Emotion Analysis Result</h2>
            <div className=" flex flex-row justify-center items-center w-full h-full px-6 py-6 space-x-6">
              <div className="w-40 h-40 md:w-80 md:h-60 lg:w-100 lg:h-80 min-h-fit rounded-2xl border-2">
                {file && (
                  <img src={URL.createObjectURL(file)} alt="Preview" className="object-contain rounded-2xl" />
                )}
              </div>              
              <div className="h-full">
                {}
                <div className="flex flex-col justify-center items-center w-full h-full">
                  <div className={`w-full bg-blue-300 rounded-t-2xl ${emotion}`}></div>
                  <h3 className="text-left font-bold text-lg text-gray-600">Happy</h3>
                </div>

              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

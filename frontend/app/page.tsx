'use client'
import { useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
const emotion_dict: Record<number, string> = {
  0: "Angry",
  1: "Disgust",
  2: "Fear",
  3: "Happy",
  4: "Sad",
  5: "Surprise",
  6: "Neutral"
}

export default function Home() {

  const [camera, setCamera] = useState<Boolean>(true)
  const video = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const inputHTMLFileRef = useRef<HTMLInputElement>(null)
  const [emotion, setEmotion] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })
        streamRef.current = stream
        if (video.current) {
          video.current.srcObject = stream
        }
      } catch (err: unknown) {
        let message = "Something went wrong"
        if (err instanceof Error) {
          message = err.message
        }
        console.error(message);
      }
    }
    if (camera) {
      startCamera()
    } else {
      return () => {
        stopCamera()
      }
    }
    return () => {
      stopCamera()
    }
  }, [camera])

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks()
      tracks.forEach(element => element.stop())
      streamRef.current = null
    }
  }
  const captureImage = (): Promise<File | null> => {
    return new Promise((resolve, reject) => {
      if (!video.current) {
        resolve(null);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = video.current.videoWidth;
      canvas.height = video.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
            setImage(newFile);
            resolve(newFile);
          } else {
            resolve(null);
          }
        }, 'image/jpeg');
      } else {
        console.error("Failed to create context");
        resolve(null);
      }
    });
  };
  const changeMethod = ()=>{
    if (camera){
      setCamera(false)
    }else{
      setCamera(true)
    }
    setImage(null)
  }
  const sendAPI = async(file: File)=>{
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai/emotion/predict`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      setEmotion(response.data.emotion);
    } catch (err: unknown) {
      let message = "Something went wrong";
      if (err instanceof Error) message = err.message;
      console.error(message);
    } finally {
      setIsLoading(false);
    }
  }
  const handleMainClick = async () => {
    if (camera) {
      setIsLoading(true);
      const capturedFile = await captureImage(); 
      if (!capturedFile) {
        console.error("Capture failed");
        setIsLoading(false);
        return;
      }
      await sendAPI(capturedFile)
    } else {
      if (!inputHTMLFileRef.current?.files){
        return 
      }
      await sendAPI(inputHTMLFileRef.current?.files[0])
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-zinc-50 font-sans py-10 space-y-4 px-4 sm:px- gap-10">
      <div className="absolute max-h-50 inset-0 w-full flex items-start justify-center py-24 px-16 bg-linear-to-r from-blue-600 to-blue-300">
      </div>
      <h1 className="font-bold text-center text-3xl md:text-4xl lg:text-5xl z-10 text-white drop-shadow-md mb-4">
        Emotion Detect
      </h1>
      <div className="flex flex-col lg:flex-row items-start justify-center w-full max-w-7xl z-10 gap-6 lg:gap-8">
        <div className="w-full lg:w-4/12 p-6 border-2 rounded-2xl bg-white flex flex-col items-center shadow-lg">
          <h2 className="text-center font-bold text-2xl text-gray-600">IMAGE INPUT</h2>
          
          <div className="flex flex-row justify-center space-x-4 items-center py-6">
            <button className={`border-b-2 ${camera ? "text-blue-500 border-blue-500" : "text-gray-500 border-transparent hover:text-gray-700"} font-bold transition duration-200`} onClick={changeMethod}>Use Camera</button>
            <button className={`border-b-2 ${!camera ? "text-blue-500 border-blue-500" : "text-gray-500 border-transparent hover:text-gray-700"} font-bold transition duration-200`} onClick={changeMethod}>Upload File</button>
          </div>

          <div className="w-full aspect-video max-w-[20rem] lg:max-w-none bg-gray-100 rounded-2xl overflow-hidden border">
            {camera ?
              <video
                ref={video}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              /> :
              <div className="w-full h-full flex flex-col justify-center items-center p-4">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  ref={inputHTMLFileRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setImage(e.target.files[0])
                  }}
                />
                <label htmlFor="file-upload" className="text-center font-semibold text-gray-600 flex flex-col items-center justify-center cursor-pointer hover:text-blue-500 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>แตะเพื่ออัปโหลด</span>
                </label>
              </div>
            }
          </div>

          <button className="mt-6 text-center font-bold text-lg text-white bg-blue-500 border-2 border-blue-500 rounded-lg px-2 py-3 w-full transition duration-200 hover:bg-white hover:text-blue-500"
            onClick={handleMainClick} disabled={isLoading ? true:false}>
              {isLoading ? "Processing": (camera ? "Capture Photo":"Upload File")}
          </button>
        </div>
        <div className="w-full lg:w-8/12 p-6 border-2 rounded-2xl bg-white flex flex-col items-center shadow-lg min-h-80">
          <h2 className="font-bold text-center text-2xl text-gray-600 mb-6">Emotion Analysis Result</h2>
          <div className="flex flex-col xl:flex-row justify-center items-center w-full gap-8">
            
            <div className="w-fit h-fit rounded-2xl border-2 border-gray-300 overflow-hidden flex justify-center items-center bg-gray-50 shrink-0">
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="h-40 md:h-60 lg:h-60 xl:h-72 w-auto object-contain"
                />
              ) : (
                <div className="h-40 w-40 md:h-60 md:w-64 lg:h-60 lg:w-[20rem] flex items-center justify-center text-gray-400 text-sm md:text-base">
                  <span>No Image Selected</span>
                </div>
              )}
            </div>
            <div className="h-64 w-full xl:w-auto flex flex-row justify-center xl:justify-start items-end space-x-2 sm:space-x-4 p-4 border rounded-xl overflow-x-auto">
              {emotion.map(((value, index) => {
                const heightPercent = `${value * 100}%`;
                return (
                  <div className="flex flex-col justify-end items-center w-8 sm:w-12 h-full gap-2 shrink-0" key={index}>
                    <div className={`w-full bg-blue-300 rounded-t-lg transition-all duration-500 ease-out hover:bg-blue-400`} style={{ height: heightPercent }}>
                    </div>
                    <h3 className="text-center font-bold text-xs sm:text-sm text-gray-600 truncate w-full">{emotion_dict[index]}</h3>
                  </div>
                )
              }))}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
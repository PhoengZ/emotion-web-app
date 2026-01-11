from fastapi import APIRouter, File, UploadFile, HTTPException
from services.ai_services import ai_service

router = APIRouter()

@router.post("/emotion/predict")
async def getEmotions(file: UploadFile = File(...)):
    if ai_service == None:
        return HTTPException(status_code=500, detail="Model not loaded")
    image_byte = await file.read()
    result = ai_service.predict_image(image_byte)
    return {"emotion":result}
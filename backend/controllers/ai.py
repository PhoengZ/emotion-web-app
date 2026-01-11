from fastapi import APIRouter
from services.ai_services import ai_service
from Class.request import EmotionBody

router = APIRouter()

@router.post("/emotion/predict")
async def getEmotions(req:EmotionBody):
    if ai_service == None:
        return {"error":"Model not loaded"}
    pixel_vals = req.pixel_values
    result = ai_service.predict_image(pixel_vals)
    return {"emotion":result}
from fastapi import APIRouter
from ..main import model
from ..Class.request import EmotionBody

router = APIRouter()

@router.post("/emotion/predict")
async def getEmotions(req:EmotionBody):
    if model == None:
        return {"error":"Model not loaded"}
    pixel_vals = req.pixel_values
    result = model.predict_image(pixel_vals)
    return {"emotion":result}
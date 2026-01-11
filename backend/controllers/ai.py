from fastapi import APIRouter
from ..main import model
router = APIRouter()

@router.post("/emotion/predict")
async def getEmotions(req):
    if model == None:
        return {"error":"Model not loaded"}
    
    
    return 
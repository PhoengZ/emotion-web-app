from fastapi import APIRouter

router = APIRouter()

@router.post("/emotion/predict")
async def getEmotions():
    return 
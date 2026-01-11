from pydantic import BaseModel

class EmotionBody(BaseModel):
    pixel_values: list[float]


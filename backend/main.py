from fastapi import FastAPI
import uvicorn
import os
from dotenv import load_dotenv
from controllers import ai
from contextlib import asynccontextmanager
from Class.ImageClassifier import ImageClassifer

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    try:
        # model = EmotionCNN()
        # device = "cuda" if torch.cuda.is_available() else "cpu"
        # model.load_state_dict(torch.load("emotion_model.pth", torch.device(device)))
        # model.eval()
        # print("Successfully Loading Model!")
        model = ImageClassifer("emotion_model.pth")
        model.model_loader()

    except Exception as e:
        print("Failed to load emotion model!")
        model = None   
    yield
    model = None

app = FastAPI(lifespan=lifespan)

app.include_router(router=ai.router, prefix="/api/ai", tags=["AI"])

if __name__ == "__main__":
    load_dotenv()
    backend_url = os.getenv("BACKEND_URL")
    port = int(os.getenv("PORT"))
    env = os.getenv("ENVIRONMENT")
    dev =  True if env == "Development" else False
    # <File name>:Variable store fastAPI instance
    uvicorn.run("main:app",host=backend_url, port=port, reload=dev)

from fastapi import FastAPI
import uvicorn
import os
from dotenv import load_dotenv
from controllers import ai


app = FastAPI()

app.include_router(router=ai.router, prefix="/api/ai", tags=["AI"])

if __name__ == "__main__":
    load_dotenv()
    backend_url = os.getenv("BACKEND_URL")
    port = int(os.getenv("PORT"))
    env = os.getenv("ENVIRONMENT")
    dev =  True if env == "Development" else False
    # <File name>:Variable store fastAPI instance
    uvicorn.run("main:app",host=backend_url, port=port, reload=dev)

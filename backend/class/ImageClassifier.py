from model import EmotionCNN
from torchvision import transforms
import torch

class ImageClassifer:
    def __init__(self, path:str):
        self.model = None
        self.model_path = path
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.transform = transforms.Compose([
            transforms.Resize((48,48)),
            transforms.Grayscale(num_output_channels=1),
            transforms.ToTensor(),
            transforms.Normalize((0.5,),(0.5,))
        ]) 
        self.result = {
            0:"Angry",
            1:"Disgust",
            2:"Fear",
            3:"Happy",
            4:"Sad",
            5:"Surprise",
            6:"Neutral"
        }
    
    def model_loader(self):
        self.model = EmotionCNN()
        state = torch.load(self.model_path, map_location=self.device)
        self.model.load_state_dict(state)
        self.model.to(self.device)
        self.model.eval()
        print("Successfully loading model!")
    
    def predict_image(self, pixel_values):
        if self.model == None:
            return "Model isn't loading!"
        with torch.no_grad():
            output = self.model(pixel_values)
            _, index = torch.argmax(output.data, dim=1) 
            return self.result[index]
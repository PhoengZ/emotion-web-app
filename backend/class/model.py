import torch.nn as nn
import torch.nn.functional as F

class EmotionCNN(nn.Module):
  def __init__(self, num_class=7):
    super(EmotionCNN, self).__init__()
    self.conv1 = nn.Conv2d(in_channels=1, out_channels=32, kernel_size=3, padding=1)
    # if data are a text or plain one way data such as text or Audio(signal) have to use Conv1d, if data is image have to use Conv2d because data can be readed x and y at the same time
    # if data contain components of width, high, time such as video have to use Conv3d
    # kernel size is frame that ai use to move 3x3 pixel on the image and move it one by one through layer to creating output from layer
    # The less attention one pays to small details, the more interested one becomes.
    # padding is adding value 0 around the image to prevent value close the edge
    self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
    # pool is used to decompose image from 48x48 to 24x24 by using parameter kernel_size = 2 for the size of small pictures and stride = 2 to move two by two and compose these picture to
    # one picture that size is 24x24 so
    self.conv2 = nn.Conv2d(in_channels=32, out_channels=64, kernel_size=3, padding=1)
    self.conv3 = nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3, padding=1)
    self.bn1 = nn.BatchNorm2d(32)
    self.bn2 = nn.BatchNorm2d(64)
    self.bn3 = nn.BatchNorm2d(128)
    # make output from each layer equaly distributed (std = 1) and mean = 0 and can prevent exloading value
    self.fc1 = nn.Linear(in_features=128*6*6, out_features=512)
    # the reason using 128*6*6 because input's shape is (128,6,6), 6 come from after through each layer have to decompose by using pool 48->24->12->6
    self.fc2 = nn.Linear(in_features=512, out_features=num_class)
    # use fc for connect all input
    # use Linear instead other because Linear can also merge all data to classifer like other and make ai easy for doing backpropagation

  def forward(self, x):
    x = self.pool(F.relu(self.bn1(self.conv1(x))))
    x = self.pool(F.relu(self.bn2(self.conv2(x))))
    x = self.pool(F.relu(self.bn3(self.conv3(x))))
    # use relu to be activation function because it is standard for deep learning. and activation function make ai can learn non-linear relation
    x = x.view(-1, 128*6*6)
    # view using for making reshape data for each image, each row size is 128*6*6 and because we don't know number of row to make total batch we will use -1 to let pytorch find value for this parameter
    x = F.relu(self.fc1(x))
    x = F.dropout(x, p=0.5, training=self.training)
    # dropout is function to choose which node have to remove from calculation
    # x is input that pass throug fucntion dropout, p is "probability" (chance) for zeroing out an element. (e.g., p=0.5 means 50% chance to be set to 0).
    # training using to check that this round have to use dropout function or not when pass to this function, if model.training() it will use dropout otherwise it not use
    x = self.fc2(x)
    return x
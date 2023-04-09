# Importing all necessary libraries
import cv2
import os
import math
# Read the video from specified path
cam = cv2.VideoCapture("Fourth_try.mp4")
frameRate = cam.get(5) #frame rate
  
try:
      
    # creating a folder named data
    if not os.path.exists('data'):
        os.makedirs('data')
  
# if not created then raise error
except OSError:
    print ('Error: Creating directory of data')
  
# frame
currentframe = 0
  
while(cam.isOpened()):
    frameId = cam.get(1)
    ret, frame = cam.read()
    if ret!=True:
        break
    if frameId % math.floor(frameRate) != 0:
        continue
    name = './data/frame' + str(currentframe) + '.jpg'
    print ('Creating...' + name)
    # gray=cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    # writing the extracted images
    cv2.imwrite(name, frame)

    # increasing counter so that it will
    # show how many frames are created
    currentframe += 1
  
# Release all space and windows once done
cam.release()
cv2.destroyAllWindows()

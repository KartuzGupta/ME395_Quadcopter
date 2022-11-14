import cv2
import numpy as np
def empty(img):
    pass
running = True
video  = cv2.VideoCapture('tcp://192.168.1.1:5555')
cv2.namedWindow("Trackbar")
cv2.resizeWindow("Trackbar",600,300)
cv2.createTrackbar("hue_min","Trackbar",0,179,empty)
cv2.createTrackbar("hue_max","Trackbar",179,179,empty)
cv2.createTrackbar("sat_min","Trackbar",0,255,empty)
cv2.createTrackbar("sat_max","Trackbar",255,255,empty)
cv2.createTrackbar("val_min","Trackbar",0,255,empty)
cv2.createTrackbar("val_max","Trackbar",255,255,empty)
while running:
    # get current frame of video
    runqning, Video = video.read()
    hsv = cv2.cvtColor(Video,cv2.COLOR_BGR2HSV)
    hue_min = cv2.getTrackbarPos("hue_min","Trackbar")
    hue_max = cv2.getTrackbarPos("hue_max","Trackbar")
    sat_min = cv2.getTrackbarPos("sat_min","Trackbar")
    sat_max = cv2.getTrackbarPos("sat_max","Trackbar")
    val_min = cv2.getTrackbarPos("val_min","Trackbar")
    val_max = cv2.getTrackbarPos("val_max","Trackbar")

    # for Green Color
    green_lower = np.array([hue_min,sat_min,val_min])
    green_upper = np.array([hue_max,sat_max,val_max])
    green_mask = cv2.inRange(hsv,green_lower,green_upper)
    green_cnts,green_hei = cv2.findContours(green_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    for green in green_cnts:
        green_Area = cv2.contourArea(green)
        if green_Area>300:
            green_peri = cv2.arcLength(green, True)
            green_approx = cv2.approxPolyDP(green, 0.02*green_peri,True)
            x,y,w,h = cv2.boundingRect(green)
            cv2.rectangle(Video, (x,y),(x+w,y+h),(0,255,0),2)
            #cv2.putText(Video,"Points: " +str(len(approx)), (x+w+20, y+h+20),cv2.FONT_HERSHEY_COMPLEX, 0.7,(0,225,0),2)
            if len(green_approx) >=4:
            #print("green")
                cv2.putText(Video,"Detected", (x+w+20, y+h+45),cv2.FONT_HERSHEY_COMPLEX, 0.7,(0,225,0),2)
    cv2.imshow('frame',Video)
    cv2.imshow("green Mask",green_mask)
    k = cv2.waitKey(1)
    if k==ord('q'):
        running = False

video.release()
cv2.destroyAllWindows()
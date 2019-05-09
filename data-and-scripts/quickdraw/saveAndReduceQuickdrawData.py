from os import listdir
from os.path import isfile, join
import random
import json
import sys

def getRecognizedDrawings(drawings, drawingCount):
    drawingsCount = len(drawings)
    listOfRecognizedDrawings = []
    dictOfAddedDrawings = {}
    while len(listOfRecognizedDrawings)<drawingCount:
        ranIndex = random.randint(0,drawingsCount-1)
        jsonDrawing = json.loads(drawings[ranIndex])
        key_id = jsonDrawing["key_id"]
        if jsonDrawing["recognized"]==True and not (key_id in dictOfAddedDrawings):
            drawingList = jsonDrawing["drawing"]
            dictOfAddedDrawings[str(key_id)] = True
            newDrawingList = []
            maxX = 0
            maxY = 0
            for line in drawingList:
                newLine = []
                for pointIndex in range(len(line[0])):
                    x = line[0][pointIndex]
                    y = line[1][pointIndex]
                    if x>maxX:
                        maxX=x
                    if y>maxY:
                        maxY=y
                    newLine.append(x)
                    newLine.append(y)
                newDrawingList.append(newLine)

            if maxX<254:
                xTranslate = (255-maxX)/2
                for newLine in newDrawingList:
                    for pointIndex in range(0,len(newLine),2):
                        newLine[pointIndex] += xTranslate
            if maxY<254:
                yTranslate = (255-maxY)/2
                for newLine in newDrawingList:
                    for pointIndex in range(1,len(newLine),2):
                        newLine[pointIndex] += yTranslate

            listOfRecognizedDrawings.append(newDrawingList)
    return listOfRecognizedDrawings

def main():
    n = int(sys.argv[1])
    quickdraw_path =sys.argv[2] + "/"
    allDrawingsJson = {}

    filenames = [f for f in listdir(quickdraw_path) if isfile(join(quickdraw_path, f))]

    for i in range(len(filenames)):
        filename = filenames[i]
        print("at file " + str(i+1) + "/" + str(len(filenames)) + ": " + filename + "                         ", end="\r")
        drawingName = filename[:-7]
        f = open(quickdraw_path+filename, 'r')
        drawings = f.readlines()
        f.close()
        allDrawingsJson[drawingName] = getRecognizedDrawings(drawings, n)

    print("")
    print("writing dataset")

    with open("quickdraw_data"+str(n)+".js", 'w') as f:
        f.write("quickdraw_data"+str(n)+"=")
        f.write(json.dumps(allDrawingsJson))

    print("finished")



if __name__ == "__main__":
    main()

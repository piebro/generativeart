gat.path = {
  bboxToTranslateScaleRotate: function(pathBbox, drawBbox, rotationAngle, keepRatio){
    if (keepRatio==undefined){
      keepRatio = false
    }

    let pathWidth = pathBbox[2]-pathBbox[0]
    let pathHeight = pathBbox[3]-pathBbox[1]
    let drawBoxWidth = drawBbox[2]-drawBbox[0]
    let drawBoxHeight = drawBbox[3]-drawBbox[1]

    let scale = [drawBoxWidth/pathWidth,drawBoxHeight/pathHeight]

    if (keepRatio){
      scale = [Math.min(scale[0],scale[1]), Math.min(scale[0],scale[1])]
    }
    let translate = [drawBbox[0]-pathBbox[0]*scale[0], drawBbox[1]-pathBbox[1]*scale[1]]

    if (keepRatio){
      translate[0] += (drawBoxWidth-pathWidth*scale[0])/2
      translate[1] += (drawBoxHeight-pathHeight*scale[1])/2
    }
    let midPos = [(pathBbox[0]+pathBbox[2])/2, (pathBbox[1]+pathBbox[3])/2]
    return [translate, scale, [rotationAngle, midPos]]
  },
  traslateScaleToBbox: function(pathBbox, translate, scale){
    let pathWidth = pathBbox[2] - pathBbox[0]
    let pathHeight = pathBbox[3] - pathBbox[1]
    let newtranslate = [
      translate[0]+pathWidth/2,
      translate[1]+pathHeight/2,
    ]
    let newScale = [
      scale[0]*pathWidth/2,
      scale[1]*pathHeight/2
    ]
    return [
      newtranslate[0] - newScale[0],
      newtranslate[1] - newScale[1],
      newtranslate[0] + newScale[0],
      newtranslate[1] + newScale[1],
    ]
  },
  getGetXYFunc: function(translate, scale, rotate){
    if(translate==undefined) translate = [0,0]
    if(scale==undefined) scale = [1,1]
    if(typeof(scale)=="number") scale = [scale,scale]
    let tx = translate[0];
    let ty = translate[1];
    let sx = scale[0];
    let sy = scale[1];
    let getXY = function(x,y){
      return [sx*x+tx, sy*y+ty]
    }
    if(rotate!=undefined && rotate[0] != undefined){
      let angle = rotate[0]
      let mid = rotate[1]
      mid[0] *= sx
      mid[1] *= sy
      let sinAngle = Math.sin(angle)
      let cosAngle = Math.cos(angle)
      getXY = function(x, y){
        x = sx * x - mid[0]
        y = sy * y - mid[1]
        let newX = x * cosAngle - y * sinAngle
        let newY = x * sinAngle + y * cosAngle
        x = newX + mid[0] + tx
        y = newY + mid[1] + ty
        return [x, y]
      }
    }
    return getXY;
  },
  getPath: function(path, translate, scale, rotate){
    let getXY = this.getGetXYFunc(translate, scale, rotate)
    let newPath = Array(path.length)
    for(let i=0; i<path.length; i++){
      let p = path[i]
      let tempPath = Array()
      tempPath[0] = p[0]
      for(let j=1; j<p.length; j+=2){
        let newXY = getXY(p[j],p[j+1])
        tempPath[j] = newXY[0]
        tempPath[j+1] = newXY[1]
      }
      newPath[i] = tempPath
    }
    return newPath
  },
  getPathBbox: function(path, pathBbox, drawBbox, rotationAngle, keepRatio){
    let tsr = this.bboxToTranslateScaleRotate(pathBbox, drawBbox, rotationAngle, keepRatio)
    return this.getPath(path, ...tsr)
  },
  drawPath: function(ctx, path, translate, scale, rotate){
    let getXY = this.getGetXYFunc(translate, scale, rotate)
    if (path.length<1) return
    let shapeStartPoint = path[0]
    let pathLength = path.length
    // console.log(path)
    for(let i=0; i<pathLength; i++){
      let p = path[i]
      if(p[0] == "L"){
        ctx.lineTo(...getXY(p[1],p[2]));
      }
      else if(p[0] == "C"){
        ctx.bezierCurveTo(
          ...getXY(p[1],p[2]),
          ...getXY(p[3],p[4]),
          ...getXY(p[5],p[6]),
        )
      }
      else if(p[0] == "M"){
        ctx.moveTo(...getXY(p[1],p[2]));
      }
      else if(p[0] == "ML"){
        ctx.moveTo(...getXY(p[1],p[2]));
        for(let i=3; i<p.length; i+=2){
          ctx.lineTo(...getXY(p[i],p[i+1]));
        }
      }
      else if(p[0] == "Q"){
        ctx.quadraticCurveTo(
          ...getXY(p[1],p[2]),
          ...getXY(p[3],p[4]),
        )
      }
      else if(p[0] == "Z"){
        ctx.lineTo(...getXY(shapeStartPoint[1],shapeStartPoint[2]));
        shapeStartPoint = path[(i+1)%pathLength]
      }
    }
    return
  },
  drawPathBbox: function(ctx, path, pathBbox, drawBbox, rotationAngle, keepRatio){

    let tsr = this.bboxToTranslateScaleRotate(pathBbox, drawBbox, rotationAngle, keepRatio)
    return this.drawPath(ctx, path, ...tsr)
  },

  getBboxOfPath: function(path){
    console.log("not implemented")
    return
    /* let maxX = 0;
    let maxY = 0;
    for(let i=0; i<path.length; i++){
      let p = path[i]
      // let c = path[i][0];
      // let p = path[i][1];
      if(p[0] == "L" || p[0]=="M"){
        if (maxX<p[1]) maxX=p[1]
        if (maxY<p[2]) maxY=p[2]
      }
      else if(c == "C" || c =="ML"){
        for(let i=0; i<p.length; i+=2){
          if (maxX<p[i]) maxX=p[i]
          if (maxY<p[i+1]) maxY=p[i+1]
        }
      }
    }
    return [0,0,maxX,maxY] */
  },

  textToPathAndBbox: function(text, alphabet){
    let textArray = text.split("\n");

    let textPathArray = []
    let textWidthArray = []
    for(let i in textArray){
      let pathAndWidth = alphabet.textlineToPath(textArray[i])
      textPathArray[i] = pathAndWidth.path
      textWidthArray[i] = pathAndWidth.width
    }

    let maxWidth = 0;
    for(let i in textWidthArray){
      let width = textWidthArray[i]
      if (maxWidth<width) maxWidth = width
    }

    let path = []
    let height = alphabet.lineHeight/2;
    for(let i in textPathArray){
      let tempWidth = textWidthArray[i]
      let xOffset = (maxWidth-tempWidth)/2
      let tempPath = gat.path.getPath(textPathArray[i],[xOffset,height])
      path = path.concat(tempPath)
      height += alphabet.lineHeight
    }

    return {
      path:path,
      bbox:[0,0,maxWidth,textArray.length*alphabet.lineHeight]
    }

  },

}

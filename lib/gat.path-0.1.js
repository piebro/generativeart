gat.path = {
  bboxToTranslateScaleRotate: function(pathBbox, drawBbox, rotationAngle, keepRatio){

    if (keepRatio==undefined){
      keepRatio = false
    }

    let pathWidth = pathBbox[2]-pathBbox[0]
    let pathHeight = pathBbox[3]-pathBbox[1]
    let drawBoxWidth = drawBbox[2]-drawBbox[0]
    let drawBoxHeight = drawBbox[3]-drawBbox[1]

    let translate = [drawBbox[0],drawBbox[1]]
    let scale = [drawBoxWidth/pathWidth,drawBoxHeight/pathHeight]

    if (keepRatio){
      scale = [Math.min(scale[0],scale[1]), Math.min(scale[0],scale[1])]
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
    let newPath = []
    for(let i=0; i<path.length; i++){
      newPath.push([])
      newPath[i][0] = path[i][0]
      newPath[i][1] = []
      let p = path[i][1];
      if(typeof p[0] == "number"){
        for(let j=0; j<p.length; j+=2){
          newPath[i][1].push(...getXY(p[j],p[j+1]))
        }
      } else {
        for(let j=0; j<p.length; j++){
          newPath[i][1].push(getXY(...p[j]))
        }
      }
    }
    return newPath
  },
  getPathBbox: function(path, pathBbox, drawBbox, rotationAngle, keepRatio){
    let tsr = this.bboxToTranslateScaleRotate(pathBbox, drawBbox, rotationAngle, keepRatio)
    return this.getPath(path, ...tsr)
  },
  drawPath: function(ctx, path, translate, scale, rotate){

    let getXY = this.getGetXYFunc(translate, scale, rotate)
    let lastRelPos = [0,0];
    for(let i=0; i<path.length; i++){
      let c = path[i][0];
      let p = path[i][1];
      if(c == "l"){
        ctx.lineTo(...getXY(...p));
        lastRelPos = p;
      }
      else if(c == "b"){
        ctx.bezierCurveTo(
          ...getXY(p[0],p[1]),
          ...getXY(p[2],p[3]),
          ...getXY(p[4],p[5]),
        )
        lastRelPos = [p[4],p[5]];
      }
      else if(c == "m"){
        ctx.moveTo(...getXY(...p));
        lastRelPos = p;
      }
      else if(c == "ml"){
        if(typeof p[0] == "number"){
          ctx.moveTo(...getXY(p[0],p[1]));
          for(let i=2; i<p.length; i+=2){
            ctx.lineTo(...getXY(p[i],p[i+1]));
          }
          lastRelPos = [p[p.length-2],p[p.length-1]];
        } else {
          ctx.moveTo(...getXY(...p[0]));
          for(let i=1; i<p.length; i++){
            ctx.lineTo(...getXY(...p[i]));
          }
          lastRelPos = p[p.length-1];
        }
      }
    }
    return getXY(lastRelPos)
  },
  drawPathBbox: function(ctx, path, pathBbox, drawBbox, rotationAngle, keepRatio){

    let tsr = this.bboxToTranslateScaleRotate(pathBbox, drawBbox, rotationAngle, keepRatio)
    return this.drawPath(ctx, path, ...tsr)
  },

  textToPath: function(text, alphabet, letterSpacing){
    let path = []
    let width = 0
    let maxHeight = 0
    for(let i=0; i<text.length; i++){
      let c = text[i]
      path = path.concat(gat.path.getPath(alphabet[c].path,[width,0]))
      width += alphabet[c].bbox[2]-alphabet[c].bbox[0]
      if (i<text.length-1){
        width += letterSpacing
      }
      maxHeight = Math.max(maxHeight, alphabet[c].bbox[3]-alphabet[c].bbox[1])
    }
    return {path:path, bbox:[0,0,width,maxHeight]}
  },

}


gat.alphabets = {}

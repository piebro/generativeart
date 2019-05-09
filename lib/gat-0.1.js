let gat = {}
// deprecated
gat.Randomizer = function(initSeed){
  if (initSeed == undefined) initSeed = Date.now()
  initSeed = Math.abs(initSeed)
  initSeed = initSeed % 2147483646
  if(initSeed<1){
    initSeed = Math.round(initSeed*2147483646)
  }
  initSeed = (initSeed * 9973 + 192887) % 2147483647;

  return {
    _seed: initSeed,
    next: function(min, max){
      this._seed = this._seed * 16807 % 2147483647;
      if(min == undefined) min = 0
      if(max == undefined) max = min + 1
  		return min + (max-min)*(this._seed / 2147483647);
    },
    nextInt: function(min, max){
      this._seed = this._seed * 16807 % 2147483647;
      if(min == undefined) min = 0
      if(max == undefined) max = 2147483647
      return min + this._seed%(max-min)
    },
    nextBool: function(){
      this._seed = this._seed * 16807 % 2147483647;
      return this._seed<1073741823
    },
    nextChoice: function(choiceArray){
      return choiceArray[this.nextInt(0,choiceArray.length)]
    },
  }
}

gat.ranVariable = {
  discreteDistribution: function(seed, valueProbabilityArray){
    let sum = 0;
    for(let i=0; i<valueProbabilityArray.length; i++){
      sum += valueProbabilityArray[i][1];
      valueProbabilityArray[i][1] = sum;
    }
    let scaledSeed = seed * sum;
    for(let i=0; i<valueProbabilityArray.length; i++){
      if(scaledSeed<=valueProbabilityArray[i][1]){
        return valueProbabilityArray[i][0]
      }
    }
  },

  linearDistribution: function(seed, valueProbabilityArray){
    let sum = 0;
    for(let i=0; i<valueProbabilityArray.length; i++){
      sum += valueProbabilityArray[i][1];
      valueProbabilityArray[i][1] = sum;
    }
    let scaledSeed = seed * sum;
    for(let i=0; i<valueProbabilityArray.length; i++){
      if(scaledSeed<=valueProbabilityArray[i][1]){
        if(i==0){
          return valueProbabilityArray[i][0]
        }
        let probLength = valueProbabilityArray[i][1] - valueProbabilityArray[i-1][1];
        let relScaledSeed = scaledSeed - valueProbabilityArray[i-1][1];
        let probPercent = relScaledSeed/probLength;

        let relValueDiff = valueProbabilityArray[i][0] - valueProbabilityArray[i-1][0];

        return valueProbabilityArray[i-1][0] + probPercent*relValueDiff;
      }
    }

  }
}

gat.getCenteredElement = function(elemtTag, size, borderAlpha){
  function resize(){
    let middlePos = centeredElement.getMiddlePosition();
    let style = centeredElement.element.style
    style.position = "absolute";
    style.top = middlePos.offsetY.toString()+"px";
    style.left = middlePos.offsetX.toString()+"px";
    style.width = middlePos.width.toString()+"px";
    style.height = middlePos.height.toString()+"px";
  }

  if (borderAlpha==undefined) {borderAlpha = 1}

  let centeredElement = {
    element: document.createElement(elemtTag),
    _size: size,
    borderAlpha: borderAlpha,
    getMiddlePosition: function(){

      let widthMult = this.size[1]/this.size[0];
      let alpha = this.borderAlpha
      let middlePos = {};
      if (window.innerWidth * widthMult <= window.innerHeight) {
          // stößt links und rechts an
          middlePos.width = alpha * window.innerWidth;
          middlePos.height = middlePos.width * widthMult;
      } else {
          // stößt unten und oben an
          middlePos.height = alpha * window.innerHeight;
          middlePos.width = middlePos.height / widthMult;
      }
      middlePos.offsetX = (window.innerWidth - middlePos.width) / 2;
      middlePos.offsetY = (window.innerHeight - middlePos.height) / 2;
      return middlePos;
    },
    get size(){
        return this._size
    },
    set size(sizeArg){
      if (sizeArg[0]==this._size[0] && sizeArg[1]==this._size[1]){
        return
      }
      this._size = sizeArg
      this.element.width = sizeArg[0];
      this.element.height = sizeArg[1];
      resize()
    },
  }

  centeredElement.element.width = centeredElement.size[0];
  centeredElement.element.height = centeredElement.size[1];

  resize()
  document.body.appendChild(centeredElement.element);
  window.addEventListener("resize", resize);
  return centeredElement
}

gat.getFullscreenCanvas = function(){
  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  let canvas = document.createElement('canvas');
  canvas.style = "position:fixed;width:100%;height:100%;left:0;top:0;"
  resize()

  window.addEventListener("resize", resize);

  document.body.appendChild(canvas);
  return canvas
}

gat.checkMobile = function(){
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

gat.downloadText = function(filename, text){
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

gat.downloadCanvas = function(filename, canvas) {
  var element = document.createElement('a');
  element.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

gat.newSeed = function(digitCount, base) {
  let hexStr = Math.floor(Math.random()*(base**digitCount)).toString(16);
  return "0".repeat(digitCount - hexStr.length) + hexStr;
}

gat.checkAndAddSeedURL = function(digitCount, base){
  if(!new URLSearchParams(window.location.search).has("seed")) gat.setURLQueryParam("seed", gat.newSeed(digitCount, base))
}

gat.getURLQueryParam = function(param){
  return new URLSearchParams(window.location.search).get(param);
}

gat.getURLQueryParams = function(){
  out = {};
  new URLSearchParams(window.location.search).forEach(function(value, key){
    out[key] = value
  });
  return out
}

gat.setURLQueryParam = function(param, value){
  let urlParam = new URLSearchParams(window.location.search);
  urlParam.delete(param)
  urlParam.append(param, value)
  let url = window.location.protocol + window.location.hostname + window.location.pathname + "?" + urlParam.toString();
  window.history.replaceState(null, "", url);
}

gat.setURLQueryParams = function(paramValueObj){
  let urlParam = new URLSearchParams(window.location.search);
  for(param in paramValueObj){
    urlParam.delete(param)
    urlParam.append(param, paramValueObj[param])
  }
  let url = window.location.protocol + window.location.hostname + window.location.pathname + "?" + urlParam.toString();
  window.history.replaceState(null, "", url);
}

gat.getSeedList = function(seedDigitCount, seedBase){
  return {
    currentSeedIndex: 0,
    seeds:[gat.getURLQueryParam("seed")],
    seedDigitCount: seedDigitCount,
    seedBase: seedBase,
    next: function(){
      this.currentSeedIndex++;
      if(this.currentSeedIndex+1 >= this.seeds.length){
        this.seeds.push(gat.newSeed(this.seedDigitCount, this.seedBase));
      }
      return this.seeds[this.currentSeedIndex];
    },
    prev: function(){
      if (this.currentSeedIndex>0) this.currentSeedIndex--;
      return this.seeds[this.currentSeedIndex];
    },
    current: function(){
      return this.seeds[this.currentSeedIndex];
    }
  }
}
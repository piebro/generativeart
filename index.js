checkUrlArgs()

function checkUrlArgs(){
  let algNameToUrlMap = {
    "simpleagent":"2019/simpleagent"
    "disortion":"2019/disortion",
    "writing":"2019/writing",
    "quickdraw1":"2018/quickdraw1",
    "bezierplaying":"2018/bezierplaying",
    "signals2":"2018/signals2",
    "signals":"2018/signals",
    "syncbrush":"2018/syncbrush",
    "bezierbrush":"2018/bezierbrush",
    "swisschees":"2018/swisschees",
    "mandala":"2018/mandala",
  }

  let args = {};
  let url = new URL(window.location.href);
  if (url.searchParams.get("seed") == null) return

  let seedStrArray = url.searchParams.get("seed").split(/_(.+)/)
  let algName = seedStrArray[0]
  let seedNum = seedStrArray[1]
  let newUrl = "/" + algNameToUrlMap[algName]
  newUrl += "/" + "?seed=" + seedNum
  window.location.assign(newUrl);
}

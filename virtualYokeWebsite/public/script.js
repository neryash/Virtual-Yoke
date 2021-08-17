const url = window.location.href;
var ip = url.substring(url.indexOf("?ip=")+4,url.length)
ip = ip.split("i").join(".");
const socket = io("https://"+ip+":16", { transports: ['websocket', 'polling', 'flashsocket'], secure:true, rejectUnauthorized: false});
var rootElem = document.documentElement;
var throttlePer = 0, rudderPer = 0;
var fullscreen = false;
var connectiona = false;
var initialized = false;
function handleOrientation(event) {
  var x = event.beta;  // In degree in the range [-180,180], x, 'front to back'
  var y = event.gamma; // In degree in the range [-90,90], y, 'left to right'
  var z = event.alpha; // 0-360, z, compass orientation
  throttlePer = document.querySelector(".throttleSlider").value/100;
  rudderPer = (document.querySelector(".rudderSlider").value-100)/100;
  if(initialized){
    socket.emit("rotation", {lr:x,ud:y,throttle:throttlePer,rudder:rudderPer,connection:connectiona});
  }
}
socket.on("connected",function(data) {
  connectiona = data;
  if(!connectiona){
    document.querySelector(".disconnect").style.backgroundColor = "#00FF00";
    document.querySelector(".disconnect>h3").innerHTML = "Connect";
  }else{
    document.querySelector(".disconnect").style.backgroundColor = "#FF0000";
    document.querySelector(".disconnect>h3").innerHTML = "Disconnect";
  }
  initialized = true;
})
document.querySelector(".rudderSlider").value = 100;
document.querySelector(".rudderSlider").addEventListener("touchend", function(){
  document.querySelector(".rudderSlider").value = 100;
}, false);
function resetRudder() {
  document.querySelector(".rudderSlider").value = 100;
}
window.addEventListener('deviceorientation', handleOrientation);
/* View in fullscreen */
function openFullscreen() {
  if (rootElem.requestFullscreen) {
    rootElem.requestFullscreen();
  } else if (rootElem.webkitRequestFullscreen) { /* Safari */
    rootElem.webkitRequestFullscreen();
  } else if (rootElem.msRequestFullscreen) { /* IE11 */
    rootElem.msRequestFullscreen();
  }
  fullscreen = true;
}

function toggleFull() {
  if(fullscreen){
    closeFullscreen()
    document.querySelector(".fullscreenToggle").src = "enterFull.png"
  }else{
    openFullscreen();
    document.querySelector(".fullscreenToggle").src = "exitFull.png"
  }
}

function toggleConnection(){
  if(connectiona){
    document.querySelector(".disconnect").style.backgroundColor = "#00FF00";
    document.querySelector(".disconnect>h3").innerHTML = "Connect";
  }else{
    document.querySelector(".disconnect").style.backgroundColor = "#FF0000";
    document.querySelector(".disconnect>h3").innerHTML = "Disconnect";
  }
  connectiona = !connectiona;
  // socket.emit("conChange",connection);
}


/* Close fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
  fullscreen = false;
}

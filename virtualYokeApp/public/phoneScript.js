const socket = io();
var rootElem = document.documentElement;
var throttlePer = 0, rudderPer = 0;
var fullscreen = false;
function handleOrientation(event) {
  var x = event.beta;  // In degree in the range [-180,180], x, 'front to back'
  var y = event.gamma; // In degree in the range [-90,90], y, 'left to right'
  var z = event.alpha; // 0-360, z, compass orientation
  throttlePer = document.querySelector(".throttleSlider").value/100;
  rudderPer = (document.querySelector(".rudderSlider").value-100)/100;
  socket.emit("rotation", {lr:x,ud:y,throttle:throttlePer,rudder:rudderPer});
}
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

const socket = io();

socket.on("rotationChange",function(data){
  var rotBys = {upDown:data.ud,leftRight:data.lr}

  document.querySelector(".alpha").innerHTML= Math.round(rotBys.upDown);
  document.querySelector(".yoke").style.transform = 'rotate('+ (rotBys.leftRight) +'deg) rotateX('+(rotBys.upDown)+'deg)';
})

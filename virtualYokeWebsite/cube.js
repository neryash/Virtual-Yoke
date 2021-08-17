function generateRandomInt(){
   Cube.number = Math.floor(Math.random()*6+1);
}

var Cube={
   number: 0
}
var div = document.createElement("div");
var img = document.createElement("img");
console.log(Cube.number);
document.body.appendChild(div);
div.appendChild(img);
function printingCube(){
   generateRandomInt();
   img.src = "./dice" +Cube.number+".png";

}

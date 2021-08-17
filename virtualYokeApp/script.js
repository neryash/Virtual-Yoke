//IP stuff
const internalIp = require('internal-ip');
var localIP = internalIp.v4.sync();
console.log(localIP);
// var link = "https://virtualyoke.herokuapp.com/?ip=" + localIP.replace(/\./g,"i");
var urlIp = localIP.split(".").join("i");
var link = "https://"+localIP+":16";
console.log(link);
//Generate SSL
const makeCert = require("make-cert")
const {key, cert} = makeCert(localIP)
console.log(key)
console.log(cert)
//Local server and socket vars
const fs = require("fs")
const app = require("express")();
const https = require("https");
const httpServer = https.createServer({
  key: key,
  cert: cert,
  // ca: fs.readFileSync('./test_ca.crt'),
  requestCert: false,
  rejectUnauthorized: false
},app);
const io = require("socket.io")(httpServer,{});
//Other requires
const psList = require('ps-list');
const {dialog} = require('electron').remote;

//Simulator path
var simPath = fs.readFileSync(__dirname + "/appData/simPath","utf8");
//Settings up server
// app.use(express.static("public"))

//Variable decleration
var lastTime = Math.floor(Date.now());
var thisTime,enabled = true,deviceConnected = false;

//Socket events
io.on("connection", socket => {
  socket.emit("connected",enabled)
  socket.on("rotation",function(data){
    thisTime = Math.floor(Date.now());
    enabled = data.connection;
    //data from the sockets
    var running = false;
    if(deviceConnected){
      running = enabled;
    }else{
      running = false;
    }
    if(!enabled){
      document.querySelector(".disInfo").style.display = "block";
    }else{
      document.querySelector(".disInfo").style.display = "none";
    }
      var rotBys = {ud:data.ud,thr:data.throttle + "endThr",yaw:data.rudder + "endYaw",running:enabled + "endRun",ts:thisTime+"endTime",lr:data.lr}
    //Making the data better
    if(rotBys.ud > 0){
      rotBys.lr = rotBys.lr > 0 ? 180 - rotBys.lr : (-180 - rotBys.lr);
    }
    rotBys.ud = rotBys.ud > 0 ? rotBys.ud-90 : rotBys.ud+90;
    //Showing the data in the app
    document.querySelector(".yoke").style.transform = 'rotate('+ (rotBys.lr) +'deg) rotateX('+(rotBys.ud)+'deg)';
    document.querySelector(".throttleLever").style.bottom = (data.throttle*100)+'%';
    var pedalSelector = data.rudder < 0 ? ".rudderPedal.left" : ".rudderPedal.right";
    document.querySelector(pedalSelector).style.transform = "rotateX("+(data.rudder*50)+"deg) translateY("+(Math.abs(data.rudder)*50)+"px)";
    //Sending the data to X-Plane every 1/100 of a second
    if(thisTime-lastTime >= 10){
      //This file informs xplane of the movement
      fs.writeFile('E:/SteamLibrary/steamapps/common/X-Plane 11/yokeData.txt', JSON.stringify(rotBys), function (err) {
        if (err) return console.log(err);
      });
      lastTime = thisTime;
    }
    // socket.broadcast.emit("rotationChange",rotBys)
  })
});

//Server routing
app.get("/",function(req,res) {
  // res.sendFile(__dirname + "/phone.html")
  res.redirect("https://virtualyoke.herokuapp.com/?ip="+urlIp);
})

//Start server
httpServer.listen(16, function() {
  console.log("listening");
});

//Check sim connection
async function checkSimConnection(){
  refreshSimPath()
  if(simPath.trim().length == 0){
    return [false,"simPath"];
  }
  try {
    fs.readFileSync(simPath.trim()+"/Resources/plugins/vYoke/64/win.xpl", 'utf8')
    // console.log(data)
  } catch (err) {
    console.error(err)
    try{
      fs.readFileSync(simPath.trim()+"/debug.log", 'utf8')
    }catch(err){
      return [false,"simPath"];
    }
    return [false,"plugin"];
  }
  //Check if xplane is running
  var tasks = await psList();
  for(var i = 0; i < tasks.length; i++){
    if(tasks[i].name == "X-Plane.exe"){
      return [true,"200"];
    }
  }
  return [false,"simNotRunning"];
}
function refreshSimPath(){
  simPath = fs.readFileSync(__dirname + "/appData/simPath","utf8");
}
//Check if device is Connected
async function checkDeviceConnection() {
  let clients = await io.allSockets();
  if(clients.size > 0){
    deviceConnected = true;
    return true;
  }
  deviceConnected = false;
  return false;
}
(async() => {
  while(true){
    var simConnected = await checkSimConnection()
    document.querySelector(".simErrText").style.display = "none";
    document.querySelector(".pathErr").style.display = "none";
    document.querySelector(".pluginErr").style.display = "none";
    if(simConnected[0]){
      document.querySelector(".simName").className = "simName greenText";
      document.querySelector(".simName").innerHTML = "Connected to X-Plane 11";
    }else{
      document.querySelector(".simName").className = "simName redText";
      document.querySelector(".simName").innerHTML = "Disconnected from X-Plane 11";
      if(simConnected[1] == "simPath"){
        document.querySelector(".simErrText").style.display = "block";
        document.querySelector(".simErrText").innerHTML = "Simulator path not set, click to set path";
        document.querySelector(".pathErr").style.display = "block";
      }else if(simConnected[1] == "plugin"){
        document.querySelector(".simErrText").style.display = "block";
        document.querySelector(".simErrText").innerHTML = "Plugin not installed, click to install";
        document.querySelector(".pluginErr").style.display = "block";
      }
    }
    var running = false;
    if(await checkDeviceConnection()){
      document.querySelector(".deviceName").className = "deviceName greenText";
      document.querySelector(".deviceName").innerHTML = "Connected to device";
      document.querySelector(".qrcode").style.display = "none";

      document.querySelector(".rudderCont").style.display = "flex";
      document.querySelector(".throttleCont").style.display = "block";
      document.querySelector(".yokeCont").style.display = "block";
      document.querySelector(".instructionImgCont").style.display = "none";

      running = enabled;
    }else{
      document.querySelector(".deviceName").className = "deviceName redText";
      document.querySelector(".deviceName").innerHTML = "Disconnected from device - Scan QR to connect";
      document.querySelector(".qrcode").style.display = "block";

      document.querySelector(".rudderCont").style.display = "none";
      document.querySelector(".throttleCont").style.display = "none";
      document.querySelector(".yokeCont").style.display = "none";
      document.querySelector(".instructionImgCont").style.display = "flex";

      running = false;
    }
    await new Promise(r => setTimeout(r, 1000));
  }

})();

//Set sim path dialog
function setSimPath(){
  var path = dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then(result => {
    console.log(result.canceled)
    console.log(result.filePaths)
    if(!result.canceled){
      fs.writeFile(__dirname + "/appData/simPath",result.filePaths[0],function(err) {
        if(err){
          alert("there was an unexpected error!\n" + err)
        }else{

        }
      })
    }
  }).catch(err => {
    console.log(err)
    alert("there was an unexpected error!\n" + err)
  });
}
//install plugin
function installPlugin(){
  document.querySelector(".pluginErr").innerHTML = "Loading...";
  refreshSimPath();
  var dir = simPath + "/Resources/plugins/";
  dir+="vYoke/"
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    fs.mkdirSync(dir+"64/")
    fs.copyFile(__dirname+"/plugin/win.pdb",dir+"64/win.pdb",(err) => {
      if(err){
        console.log(err);
      }
    })
    fs.copyFile(__dirname+"/plugin/win.xpl",dir+"64/win.xpl",(err) => {
      if(err){
        console.log(err);
      }
    })
    document.querySelector(".pluginErr").innerHTML = "Success!";
  }
}

function exitExplanation() {
  document.querySelector(".learnMoreCont").style.top = "100%";
}
function enterExplanation() {
  document.querySelector(".learnMoreCont").style.top = "0";
}
/* JS comes here */
var qr;
(function() {
        qr = new QRious({
        element: document.getElementById('qr-code'),
        size: 200,
        value: ''
    });
})();

function generateQRCode(txt) {
    qr.set({
        foreground: 'black',
        size: 200,
        value: txt
    });
}
generateQRCode(link);

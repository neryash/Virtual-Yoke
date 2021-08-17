//Local server and socket vars
const express = require("express");
const app = express();

//Settings up server
app.use(express.static("public"))

//Server routing
app.get("/",function(req,res) {
  res.sendFile(__dirname + "/index.html")
})

//Start server
app.listen(process.env.PORT || 3000, function() {
  console.log("listening");
});

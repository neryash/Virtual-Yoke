function gogoPowerangers(){
  const app = require("https-localhost")();

  app.get("/",function(req,res) {
    res.sendFile(__dirname + "/phone.html")
  })

  //Start server
  app.listen(16, function() {
    console.log("listening");
  });

}
gogoPowerangers();

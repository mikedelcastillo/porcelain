var express = require("express");
var app = express();
var server = require("http").Server(app);

var PORT = process.env.PORT || 3000;

app.use("/", express.static("../public"));

server.listen(PORT, function(){
  console.log(`Server running on port ${PORT}!`);
});

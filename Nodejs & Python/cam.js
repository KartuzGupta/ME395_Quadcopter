var arDrone = require('ar-drone');
var client  = arDrone.createClient();

function bottomCamera(){
  // access the bottom camera
  client.config('video:video_channel', 3);
  //require('ar-drone-png-stream')(client, { port: 8000 });
}

function frontCamera(){
  // access the front camera
  client.config('video:video_channel', 0);
  //require('ar-drone-png-stream')(client, { port: 3000 });
}
client.calibrate(1)
bottomCamera()
//frontCamera()
var arDrone = require('ar-drone');
var client  = arDrone.createClient();
var fs = require('fs');

//client.createRepl();

var keypress = require('keypress');
keypress(process.stdin);

// Get time in microseconds
var hrTime = process.hrtime()
var startTime = hrTime[0]*1000000 + hrTime[1] / 1000;
startTime = startTime/1000000;
var imageCounter = 4;
var navDataCounter = 1;

var b_exe = false;
// Time for command

var start_time, cmd_time;

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

// Store image per second in png format
function storeImages(){
  var pngStream = client.getPngStream();
  var period = 10; // Save a frame every 5000 ms.
  var lastFrameTime = 0;
  pngStream
    .on('error', console.log)
    .on('data', function(pngBuffer) {
      var curTime = process.hrtime()
      var currentTime = curTime[0]*1000000 + curTime[1] / 1000;
      currentTime = currentTime/1000000;
      var processTime = currentTime - startTime;
      processTime = Math.trunc(processTime) 
      //console.log(processTime)
    
      var now = (new Date()).getTime();
      if (processTime === imageCounter) {
        lastFrameTime = now;
        //console.log('Saving frame');
        fs.writeFile('images/frame' + processTime + '.png', pngBuffer, function(err) {
          if (err) {
            console.log('Error saving PNG: ' + err);
          }
        });
        imageCounter++;
      }
      
    });
}

// Access navigation data from drone and storing in JSON format
function getNavData(){
  client.on('navdata', (data)=>{
      //Handle drone data processing here...
      var curTime = process.hrtime()
      var currentTime = curTime[0]*1000000 + curTime[1] / 1000;
      currentTime = currentTime/1000000;
      var processTime = currentTime - startTime;
      processTime = Math.trunc(processTime) 
      //console.log(processTime);
      if(processTime === navDataCounter){
          //console.log(processTime)
          fs.readFile("nav1.json", function(err, prevData){
              if(err) throw err;
              const dat = JSON.parse(prevData);
              const time = {time: processTime}
              const drone_data = data;
              if(drone_data.hasOwnProperty('demo')){
                processNavData(time, drone_data)
                const newData = []
                newData.push(time)
                newData.push(drone_data)
                dat.push(newData);
                //dat.push(time);
                fs.writeFile("nav1.json", JSON.stringify(dat), err =>{
                    if(err) throw err;
                    //console.log("Done");
                });    
              }
          });
          navDataCounter++;
      }
  });
}

// Process Navigation Data
function processNavData(time_json, data_json){
  var time = time_json
  var drone_data = data_json
  var processedNavData = []
  // Battery
  var battery = drone_data.demo.batteryPercentage
  // Pitch ,Roll, Yaw
  var pitch = rotation.pitch
  var roll = rotation.roll
  var yaw = rotation.yaw
  // Altitude
  var alt = drone_data.demo.altitude
  // Rotation Matrix
  var rotation = drone_data.demo.rotation
  var fcamera_rot = drone_data.demo.drone.camera.rotation
  var bcamera_rot = drone_data.demo.detection.camera.rotation
  // Translation
  var ftrans_x = drone_data.demo.drone.camera.translation.x;
  var ftrans_y = drone_data.demo.drone.camera.translation.y;
  var ftrans_z = drone_data.demo.drone.camera.translation.z;

  processedNavData = 'Time: '+time.time+'\n'+'Battery: '+battery+"\n"+"Pitch: "+ pitch+ " Roll: "+ roll+ " Yaw:"+ yaw+ "\nAltitude: "+ alt;
  processedNavData += '\n'+'Camera:\n'+'Translation - x: '+ftrans_x +' y:'+ftrans_y+' z:'+ftrans_z+'\n';
  processedNavData += 'Velocity :' + drone_data.demo.velocity.x + ' ' + drone_data.demo.velocity.y + ' '+ drone_data.demo.velocity.z+ '\n';
   
  fs.writeFile('Processed_Navdata.txt', processedNavData, function(err) {
    if (err) {
      console.log('Error saving processed data ' + err);
    }
  });
}

// Keypress Detection
function key_detect(){
  process.stdin.on('keypress', function (ch, key) {
    //console.log("here's the key object", key);
   if(key.name=='l'){
      console.log("Landing...");
      client.land();
    }
    /*else if(key.name=='s'){
      console.log("Stopping....");
      client.stop();
    }
    else if(key.name=='f'){
      console.log("Moving Forward...")
      client.front(0.1);
    }
    else if(key.name=='b'){
      console.log('Moving Back..');
      client.back(0.1);
    }
    else if(key.name=='t'){
      console.log("Taking off...");
      client.takeoff();
    }*/  
  });  
}

// General Commands
function rdFile(){
  fs.readFile("instructions.txt", 'utf-8', function(err, data){
    if(err) throw err;
    console.log(data.toString());
    var cmd = data.toString();
    var ins = cmd.split(" ");
    if(ins[0]=='blred'){
      console.log("Blink Red", ins[1], ins[2]);
      client.animateLeds('blinkRed', ins[1], ins[2]);
    }
    else if(ins[0]=='blgreen'){
      console.log("Blink Green", ins[1], ins[2]);
      client.animateLeds('blinkGreen', ins[1], ins[2]);
    }
    else if(ins[0]=='t'){
      console.log("Taking Off..");
      client.takeoff();
    }
    else if(ins[0]=='f_s'){
      console.log("Moving Front...");
      client.front(ins[1]);
      client
      .after(1000, function(){
        this.stop();
      });
    }
    else if(ins[0]=='f'){
      console.log("Moving Front...");
      client.front(0.05);
    }
    
    else if(ins[0]=='s'){
      console.log("Stopping....");
      client.stop();
    }
    else if(ins[0]=='b'){
      console.log("Moving Back..");
      client.back(0.05);
    }
    else if(ins[0]=='l'){
      console.log("Landing...");
      client.land();
    }
    else if(ins[0]=='bcam'){
      console.log("Bottom Camera..")
      bottomCamera();
    }
    else if(ins[0]=='fcam'){
      console.log("Front Camera..");
      frontCamera();
    }
    else if(ins[0]=='le'){
      console.log("Moving Left..");
      client.counterClockwise(ins[1]);
      client
      client
      .after(1000, function(){
        this.front(0.05);
      })
      .after(1000, function(){
        this.stop();
      });

    }
    else if(ins[0]=='r'){
      console.log("Moving Right..");
      client.clockwise(ins[1]);
      client
      .after(1000, function(){
        this.front(0.05);
      })
      .after(1000, function(){
        this.stop();
      });
    }
    else if(ins[0]=='u'){
      console.log("Moving Up..");
      client.up(ins[1]);
    }
    else if(ins[0]=='d'){
      console.log("Moving Right..");
      client.down(ins[1]);
    }
  });
}

// Function to detect sticker

function sticker(){
  var hrTime = process.hrtime()
  cmd_time = hrTime[0]*1000000 + hrTime[1] / 1000;
  cmd_time = cmd_time/1000000;

  process_time = cmd_time-start_time;

    fs.readFile("instructions.txt", 'utf-8', function(err, data){
      if(err) throw err;
      var cmd = data.toString();
      var ins = cmd.split(" ");
      console.log(cmd);
      if(ins[0]=='f_land'){
        b_exe = true;
        console.log("Landing...");
        client.land();
      }
      else if(ins[0]=='gf_land'){
        b_exe = true;
        console.log("Detected Green..");
        client.land();
        // client.front(0);
        // client.back(0.03);
        // client
        // .after(1000, function(){
        //   this.land();
        // })
      }
      else if(ins[0]=='bf_land'){
        b_exe = true;
        console.log("Detected Blue..");
        client.land();
        // client.front(0);
        // client.back(0.03);
        // client
        // .after(1000, function(){
        //   this.land();
        // })
      }
      else if(!b_exe && ins[0]=='red'){
        console.log("Red Color Detected...")
        // client.stop();
        var hrTime = process.hrtime()
        start_time = hrTime[0]*1000000 + hrTime[1] / 1000;
        start_time = start_time/1000000;

        client
        .after(1000, function(){
          this.front(0.08);
        });
        
      }
      else if(!b_exe && ins[0]=='land' && process_time > 3){
        console.log("Waiting for further command....")
        client
        .after(1000, function(){
          client.land();
        });
      }
    
    });
}

function file_instructions(){
  fs.watch("instructions.txt", (eventType, filename) => {
    sticker();
  });
}
// Access Navigation Data
getNavData()

// Change camera, default is Front Camera
//bottomCamera()
//frontCamera()

// Initial takeoff
client.takeoff()
client
  .after(5000, function(){
   client.stop();
})

// Get Instructions from python using color detection algorithm
file_instructions()

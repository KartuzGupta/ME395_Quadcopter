# Parrot AR Drone 2.0

Used Parrot AR 2.0 Drone for our project and we made an autonomous working model that detects colour and accordingly sends commands for execution using Python and Nodejs.

[Documentation](https://docs.google.com/document/d/1z9ZHJXnDFABGQ2l_01ENDte_X5n5QpvwRte1xlL6-zw/edit?usp=sharing)

```bash
npm install git://github.com/felixge/node-ar-drone.git
```

```bash
npm install ar-drone
```

## Controlling the drone using NodeJS

Controlled the drone using laptop instead of using the [Parrot AR Drone App](https://play.google.com/store/apps/details?id=com.parrot.freeflight&hl=en_IN&gl=US&pli=1) provided by the company. Used a [NodeJS based library](https://github.com/felixge/node-ar-drone) to control our drone. Created a program using NodeJS using which we could successfully control the drone by giving instructions through the terminal. It was also possible to give a pre-defined set of functions to the drone that it would perform.

We were also able to access real-time navigation and sensor data like Time, Battery Percentage, Roll, Pitch and Yaw angles, Altitude and Translation published by the drone. We processed it and displayed the necessary values in a txt file.

### Client

This module exposes a high level Client API that tries to support all drone
features, while making them easy to use.

The best way to get started is to create a `repl.js` file like this:

```js
var arDrone = require('ar-drone');
var client  = arDrone.createClient();
client.createRepl();
```

Using this REPL, you should be able to have some fun:

```js
$ node repl.js
// Make the drone takeoff
drone> takeoff()
true
// Wait for the drone to takeoff
drone> clockwise(0.5)
0.5
// Let the drone spin for a while
drone> land()
true
// Wait for the drone to land
```

Now you could write an autonomous program that does the same:

```js
var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.takeoff();

client
  .after(5000, function() {
    this.clockwise(0.5);
  })
  .after(3000, function() {
    this.stop();
    this.land();
  });
```

Ok, but what if you want to make your drone to interact with something? Well,
you could start by looking at the sensor data:

```js
client.on('navdata', console.log);
```

Not all of this is handled by the Client library yet, but you should at the
very least be able to receive `droneState` and `demo` data.

A good initial challenge might be to try flying to a certain altitude based
on the `navdata.demo.altitudeMeters` property.

Once you have managed this, you may want to try looking at the camera image. Here
is a simple way to get this as PngBuffers (requires a recent ffmpeg version to
be found in your `$PATH`):

```js
var pngStream = client.getPngStream();
pngStream.on('data', console.log);
```

Your first challenge might be to expose these png images as a node http web
server. Once you have done that, you should try feeding them into the
[opencv](https://npmjs.org/package/opencv) module.

### Client API

#### arDrone.createClient([options])

Returns a new `Client` object. `options` include:

* `ip`: The IP of the drone. Defaults to `'192.168.1.1'`.
* `frameRate`: The frame rate of the PngEncoder. Defaults to `5`.
* `imageSize`: The image size produced by PngEncoder. Defaults to `null`.

#### client.createREPL()

Launches an interactive interface with all client methods available in the
active scope. Additionally `client` resolves to the `client` instance itself.

#### client.getPngStream()

Returns a `PngEncoder` object that emits individual png image buffers as `'data'`
events. Multiple calls to this method returns the same object. Connection lifecycle
(e.g. reconnect on error) is managed by the client.

#### client.getVideoStream()

Returns a `TcpVideoStream` object that emits raw tcp packets as `'data'`
events. Multiple calls to this method returns the same object. Connection lifecycle
(e.g. reconnect on error) is managed by the client.

#### client.takeoff(callback)

Sets the internal `fly` state to `true`, `callback` is invoked after the drone
reports that it is hovering.

#### client.land(callback)

Sets the internal `fly` state to `false`, `callback` is invoked after the drone
reports it has landed.

#### client.up(speed) / client.down(speed)

Makes the drone gain or reduce altitude. `speed` can be a value from `0` to `1`.

#### client.clockwise(speed) / client.counterClockwise(speed)

Causes the drone to spin. `speed` can be a value from `0` to `1`.

#### client.front(speed) / client.back(speed)

Controls the pitch, which a horizontal movement using the camera
as a reference point.  `speed` can be a value from `0` to `1`.

#### client.left(speed) / client.right(speed)

Controls the roll, which is a horizontal movement using the camera
as a reference point.  `speed` can be a value from `0` to `1`.

#### client.stop()

Sets all drone movement commands to `0`, making it effectively hover in place.

#### client.calibrate(device)

Asks the drone to calibrate a device. Although the AR.Drone firmware
only supports one device that can be calibrated. This function also includes ftrim.

**The Magnetometer**

Device: 0

The magnetometer can only be calibrated while the drone is flying, and
the calibration routine causes the drone to yaw in place a full 360
degrees.

**FTRIM**

Device: 1

FTRIM essentially resets the Yaw, Pitch, and Roll to 0. Be very cautious of using
this function and only calibrate while on flat surface. Never use while flying.

#### client.config(key, value, callback)

Sends a config command to the drone. You will need to download the drone
[SDK](https://projects.ardrone.org/projects/show/ardrone-api) to find a full list of commands in the `ARDrone_Developer_Guide.pdf`.

For example, this command can be used to instruct the drone to send all navdata.

```js
client.config('general:navdata_demo', 'FALSE');
```

`callback` is invoked after the drone acknowledges the config request
or if a timeout occurs.

Alternatively, you can pass an options object containing the following:

* `key`: The config key to set.
* `value`: The config value to set.
* `timeout`: The time, in milliseconds, to wait for an ACK from the drone.

For example:

```
var callback = function(err) { if (err) console.log(err); };
client.config({ key: 'general:navdata_demo', value: 'FALSE', timeout: 1000 }, callback);
```

#### client.animate(animation, duration)

Performs a pre-programmed flight sequence for a given `duration` (in ms).
`animation` can be one of the following:


```js
['phiM30Deg', 'phi30Deg', 'thetaM30Deg', 'theta30Deg', 'theta20degYaw200deg',
'theta20degYawM200deg', 'turnaround', 'turnaroundGodown', 'yawShake',
'yawDance', 'phiDance', 'thetaDance', 'vzDance', 'wave', 'phiThetaMixed',
'doublePhiThetaMixed', 'flipAhead', 'flipBehind', 'flipLeft', 'flipRight']
```

Example:

```js
client.animate('flipLeft', 1000);
```

Please note that the drone will need a good amount of altitude and headroom
to perform a flip. So be careful!

#### client.animateLeds(animation, hz, duration)

Performs a pre-programmed led sequence at given `hz` frequency and `duration`
(in sec!). `animation` can be one of the following:

```js
['blinkGreenRed', 'blinkGreen', 'blinkRed', 'blinkOrange', 'snakeGreenRed',
'fire', 'standard', 'red', 'green', 'redSnake', 'blank', 'rightMissile',
'leftMissile', 'doubleMissile', 'frontLeftGreenOthersRed',
'frontRightGreenOthersRed', 'rearRightGreenOthersRed',
'rearLeftGreenOthersRed', 'leftGreenRightRed', 'leftRedRightGreen',
'blinkStandard']
```

Example:

```js
client.animateLeds('blinkRed', 5, 2)
```

#### client.disableEmergency()

Causes the emergency REF bit to be set to 1 until
`navdata.droneState.emergencyLanding` is 0. This recovers a drone that has
flipped over and is showing red lights to be flyable again and show green
lights.  It is also done implicitly when creating a new high level client.

#### Events

A client will emit landed, hovering, flying, landing, batteryChange, and altitudeChange events as long as demo navdata is enabled.

To enable demo navdata use

```js
client.config('general:navdata_demo', 'FALSE');
```

See [documentation](https://github.com/felixge/node-ar-drone/blob/master/docs/NavData.md) for ```navadata``` object

### Camera access

You can access the head camera and the bottom camera, you just have to change
the config:

```javascript
// access the head camera
client.config('video:video_channel', 0);

// access the bottom camera
client.config('video:video_channel', 3);
```

## Image Processing using Python OpenCV

Realtime Color Detection: We trained our drone to identify different colours(RGB) in real-time with the help of Python OpenCV. We used HSV(Hue Saturation Value) values to train our drone. Our drone captures the real-time frames and refines them to detect the desired colour and display the colours in bounded rectangles with the name of the colour.

## Integration of NodeJS and Python

Integrated Python and NodeJS to control the drone. Our python code accessed the drone’s bottom camera, processed the video, detected the colour of the sticker present on the corridor and wrote the data to the instructions.txt file. NodeJS watches for changes in the instructions.txt file and reads it as soon as it detects some changes in it. It accessed the data in the instructions.txt file in real time and executed the functions accordingly. The drone would give instructions to itself depending on the colour of the sticker thus making it autonomous.

### [Demonstration](https://drive.google.com/drive/u/5/folders/1FDwGT8CeVOyPWuJZQPoyhc7nUFjX4-H8)

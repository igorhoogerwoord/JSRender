# JSRender
#### Javascript 2D Canvas and inputing handling module

Contains classes to handle sprites, rendering, layering and scene management.

#### Main renderer
```javascript
var renderer = new mainRender();
renderer.frame_rate = 30;

// get center of canvas:
renderer.midpoint.x;
renderer.midpoint.y;

// stop or pause scene:
renderer.play = false;
renderer.play = true;

// add elements to renderer:
renderer.renderCollection = [background,circle,square];

// add elements to input handler:
renderer.inputCollection = [circle,square];

// play next scene:
renderer.scene(next);
```

The renderer module writes all elements from the renderCollection to the html canvas. To stop rendering an item, its visibilty can be adjusted, or it can be removed from the renderCollection.

## Sprites

Sprites can be loaded from png images that contain all frames of an animation. The sprite class contains options for playing, looping and pausing sprite animations.

```javascript

var sp = new sprite(
  x,
  y,
  angle,
  url,
  frames,
  width,
  height,
  frame_width,
  frame_height,
  loop,
  opacity,
  scale
);

sp.image = img;
sp.sprite_frames = frames;
sp.sprite_frame_width = frame_width;
sp.sprite_frame_height = frame_height;
sp.sprite_current_frame = 0;
sp.sprite_loop = loop;
sp.sprite_loop_interval = 0;
sp.sprite_loop_interval_run = 0;
sp.sprite_run = 0;
sp.sprite_run_frames = 0;
sp.sprite_run_once = false;
sp.sprite_running = false;
sp.sprite_run_once_and_pause = false;

sp.setLoopInterval = function(interval);
sp.render = function(renderer);


```

## Preloading images and main render thread

For performance, you want to preload all images before rendering start. Therefore, the renderer calls a function called 'retrieveImage', that returns the image object for a given url.

```javascript

var preloaded_images = {};

var image_urls = [
  "../images/test1.png",
  "../images/test2.png",
  "../images/test3.png",
  "../images/test4.png"
];

function loadImages(){

  for(var ix = 0; ix < image_urls.length; ix++){

    var img = new Image();
    img.src = image_urls[ix];
    preloaded_images[image_urls[ix]] = img;

  }

};

function retrieveImage(url){
  return preloaded_images[url];
}

function start(){

  var scenes = [scene1,scene2,scene3];
  var current = 0;
  var frame_rate = 30;

  function next(interval_id){
    clearInterval(interval_id);
    if(current > scenes.length){
      current = 0;
    }
    scenes[current](next,frame_rate);
    current += 1;
  }

  next("");

}

loadImages();

```

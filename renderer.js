function mainRender(){

  this.canvas = document.getElementById("canvas");
  this.ctx = this.canvas.getContext("2d");
  this.renderCollection = [];
  this.inputCollection = [];
  // this.ctx.canvas.width  = this.canvas.offsetWidth;
  // this.ctx.canvas.height = this.canvas.offsetHeight;
  this.ctx.canvas.width = 512;
  this.ctx.canvas.height = 512;
  this.relative_x = this.canvas.width / 1000;
  this.relative_y = this.canvas.height / 1000;
  this.play = true;
  this.interval_id = "";

  this.midpoint = {
    x: this.canvas.width / 2,
    y: this.canvas.height / 2
  }

  this.clear = function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  this.render = function(){
    for(var i = 0; i < this.renderCollection.length; i++){

      // play animation if true:
      if(this.renderCollection[i].animation_play){
        this.renderCollection[i].playAnimation(this);
      }

      this.renderCollection[i].render(this);

      if(this.renderCollection[i].onRender != undefined){
        this.renderCollection[i].onRender(this.renderCollection[i]);
      }

    }
  }
  this.processInput = function(){
    for(var i = 0; i < this.inputCollection.length; i++){
      this.inputCollection[i].handleInputs();
    }
  }

  this.scene = function(next){

    var renderer = this;

    function draw(renderer) {

      renderer.clear();

      if(renderer.play){
        renderer.processInput();
        renderer.render();
      }else{
        if(next != undefined){
          next(renderer.interval_id);
        }else{
          clearInterval(renderer.interval_id);
        }
      }
    }

    this.interval_id = setInterval( function() { draw(renderer); } ,this.frame_rate);

  }

}

function group(objects,x,y,angle,width,height){

  this.objects = objects;

  this.x = x;
  this.y = y;
  this.angle = angle;
  this.width = width;
  this.height = height;

  this.update = function(){
    for(var i = 0; i < this.objects.length; i++){
      this.objects[i].x *= x;
      this.objects[i].y *= y;
      this.objects[i].angle *= angle;
      this.objects[i].width *= width;
      this.objects[i].height *= height;
    }
  }

}

function mainObject(x,y,width,height,color,angle,opacity,scale){

  // Basic values:
  this.x = x;
  this.y = y;
  this.scale = scale;
  this.width = width;
  this.height = height;
  this.color = color;
  this.angle = angle;
  this.opacity = opacity;

  // Animation values:
  this.animation_currentFrame = 0;
  this.animation_runFrames = 0;
  this.animation_loop = false;
  this.animation_relative = false;
  this.animation_frames = [];
  this.animation_currentValues = [];
  this.animation_run = 0;
  this.animation_play = false;

  // Administration values:
  this.uuid = SH.uuid();
  this.TO_RADIANS = Math.PI/180;
  this.inputs = [];
  this.pressed = false;

  // Methods:
  this.addCollision = function(physicsCollection){
    // add array of other objects to detect collision:
    collision.call(this,physicsCollection);
  }
  this.handleInputs = function(){
    // loop over this.inputs to process input events:
    for(var i = 0; i < this.inputs.length; i++){
      this.inputs[i](this);
    }
  }
  this.playAnimation = function(){

    if(this.animation_frames.length > 0 && (this.animation_run > 0 || this.animation_loop == true)){
      if(this.animation_currentFrame < this.animation_frames.length - 1){

        if(this.animation_currentFrame == 0){
          this.animation_currentValues = {};
          this.animation_currentValues.x = this.x;
          this.animation_currentValues.y = this.y;
          this.animation_currentValues.scale = this.scale;
          this.animation_currentValues.color = this.color;
          this.animation_currentValues.angle = this.angle;
          this.animation_currentValues.opacity = this.opacity;
          this.animation_currentValues.width = this.width;
          this.animation_currentValues.height = this.height;
        };

        var cframe = this.animation_frames[this.animation_currentFrame];
        if(this.animation_relative){
          this.x *= cframe.x;
          this.y *= cframe.y;
          this.scale *= cframe.scale;
          this.color *= cframe.color;
          this.angle *= cframe.angle;
          this.opacity *= cframe.opacity;
          this.width *= cframe.width;
          this.height *= cframe.height;
        }else{
          this.x = cframe.x;
          this.y = cframe.y;
          this.scale = cframe.scale;
          this.color = cframe.color;
          this.angle = cframe.angle;
          this.opacity = cframe.opacity;
          this.width = cframe.width;
          this.height = cframe.height;
        }

        this.animation_currentFrame += 1;

      }else{
        this.x = this.animation_currentValues.x;
        this.y = this.animation_currentValues.y;
        this.scale = this.animation_currentValues.scale;
        this.color = this.animation_currentValues.color;
        this.angle = this.animation_currentValues.angle;
        this.opacity = this.animation_currentValues.opacity;
        this.width = this.animation_currentValues.width;
        this.height = this.animation_currentValues.height;
        this.animation_currentFrame = 0;
        this.animation_run -= 1;
      }
    }
  }
}

function collision(physicsCollection){

  this.physicsCollection = physicsCollection;
  this.collide = [];
  this.collide_ids = []

  this.detect = function(collider,internal,margin){

    // collider is other object
    // internal is whether object is inside another
    // margin defines added space to detection

    this.collide = [];
    this.collide_ids = [];

    for (var c = 0; c < this.physicsCollection.length; c++){

      var cb = this.physicsCollection[c];

      if(internal == true){
        if(this.x + this.width / 2 > (cb.width - this.width - margin) || this.y + this.height / 2 > (cb.height - this.height - margin)){
          this.collide.push(cb);
          this.collide_ids.push(cb.uuid);
        }
      }else{
        if(this.x > cb.x && this.x < cb.x + cb.width + margin && this.y > cb.y && this.y < this.y + cb.height + margin){
          this.collide.push(cb);
          this.collide_ids.push(cb.uuid);
        }
      }
    }

    if(this.collide.length > 0){
      if(collider != undefined){
        if(this.collide_ids.includes(collider.uuid)){
          return [true,true]
        }else{
          return [true,false];
        }
      }else{
        return [true,false];
      }
    }else{
      return [false,false];
    }

  }

}

function sprite(x,y,angle,url,frames,width,height,frame_width,frame_height,loop,opacity,scale){

  // renders images as objects
  // runs sprite animations with sprite specific functions
  // inherits from mainObject
  // mainObject animation does not override sprite animations

  mainObject.call(this,x,y,width,height,"",angle,opacity,scale);

  var img = retrieveImage(url);

  this.image = img;
  this.sprite_frames = frames;
  this.sprite_frame_width = frame_width;
  this.sprite_frame_height = frame_height;
  this.sprite_current_frame = 0;
  this.sprite_loop = loop;
  this.sprite_loop_interval = 0;
  this.sprite_loop_interval_run = 0;
  this.sprite_run = 0;
  this.sprite_run_frames = 0;
  this.sprite_run_once = false;
  this.sprite_running = false;
  this.sprite_run_once_and_pause = false;

  this.setLoopInterval = function(interval){
    this.sprite_loop_interval = interval;
    this.sprite_loop_interval_run = interval;
  }

  this.render = function(renderer){

    var sx = this.sprite_current_frame * this.sprite_frame_width;

    renderer.ctx.imageSmoothingEnabled = false;

    renderer.ctx.save();
    renderer.ctx.translate(this.x,this.y);
    renderer.ctx.rotate(angle * Math.PI / 180);
    renderer.ctx.globalAlpha = this.opacity;
    renderer.ctx.drawImage(this.image, sx, 0, this.sprite_frame_width, this.sprite_frame_height, -(this.width/2), -(this.height/2), this.width, this.height);
    renderer.ctx.restore();

    if(this.sprite_run > 0){
      if(this.sprite_current_frame < this.sprite_frames - 1){

        if(this.sprite_run_frames > 0 && this.sprite_run_once == true){
          this.sprite_current_frame += 1;
          this.sprite_run_frames -= 1;
        }else if(this.sprite_run_once == false){
          this.sprite_current_frame += 1;
        }

        this.sprite_running = true;

      }else{

        this.sprite_run -= 1;

        if(this.sprite_run > 0){
          this.sprite_current_frame = 0;
        }else{
          if(this.sprite_run_once_and_pause == false){
            this.sprite_current_frame = 0;
          }
          this.sprite_running = false;
        }
      }
    }else{

      if(this.sprite_loop){
        if(this.sprite_current_frame < this.sprite_frames -1){

          this.sprite_running = true;

          if(this.sprite_run_frames > 0 && this.sprite_run_once == true){
            this.sprite_current_frame += 1;
            this.sprite_run_frames -= 1;
          }else if(this.sprite_run_once == false){
            this.sprite_current_frame += 1;
          }
        }else{
          if(this.sprite_loop_interval > 0){
            if(this.sprite_loop_interval_run > 0){
              this.sprite_running = false;
              this.sprite_loop_interval_run -= 1;
            }else{
              this.sprite_current_frame = 0;
              this.sprite_running = true;
              this.sprite_loop_interval_run = this.sprite_loop_interval;
            }
          }else{
            this.sprite_current_frame = 0;
          }
        }
      }else{
        this.sprite_running = false;
      }
    }

  }
}

function plane(x,y,angle,width,height,color,opacity,scale){

  mainObject.call(this,x,y,width,height,color,angle,opacity,scale);

  this.render = function(renderer){

    renderer.ctx.fillStyle = this.color;
    renderer.ctx.save();
    renderer.ctx.translate(this.width/2, this.height/2);
    renderer.ctx.rotate(angle * this.TO_RADIANS);
    renderer.ctx.globalAlpha = this.opacity;
    renderer.ctx.fillRect(this.x, this.y, this.width, this.height);
    renderer.ctx.restore();

  }
}

function circle(x,y,angle,radius,color,opacity,scale){

  // radius is passed as both width and height
  mainObject.call(this,x,y,radius,radius,color,angle,opacity,scale);

  this.radius = radius;
  this.sangle = 0;
  this.eangle = Math.PI*2;

  this.render = function(renderer){

    renderer.ctx.beginPath();
    renderer.ctx.arc(this.x, this.y, this.radius, this.sangle, this.eangle);
    renderer.ctx.fillStyle = this.color;

    renderer.ctx.save();
    renderer.ctx.translate(this.width / 2, this.height / 2);
    renderer.ctx.rotate(angle * this.TO_RADIANS);

    renderer.ctx.fill();
    renderer.ctx.closePath();
    renderer.ctx.restore();

  }

};

function text(x,y,width,height,angle,color,opacity,scale,textValue,font,textAlign){

  mainObject.call(this,x,y,width,height,color,angle,opacity,scale);

  this.fontSize = height;
  this.font = font;
  this.textValue = textValue;
  this.textAlign = "center";

  this.render = function(renderer){
    renderer.ctx.fillStyle = this.color;
    renderer.ctx.textAlign = this.textAlign;
    renderer.ctx.font = this.height + "px " + this.font;
    renderer.ctx.fillText(this.textValue,this.x,this.y);
  }

}

function keyInput(event) {
    var x = event.which || event.keyCode;
}

var keys = {};
keys.tracked = []

function keyDown(event){

  if(typeof event != ""){
    if(event.type != undefined && event.type == "mousedown"){
      keys["mouse"] = true;
    }else{
      keys[event.which.toString()] = true;
    }
  }else{
    if(event == "touchdown"){
      keys["touch"] = true;
    }
  }

}

function keyUp(event){

  if(typeof event != ""){
    if(event.type != undefined && event.type == "mouseup"){
      keys["mouse"] = false;
    }else{
      keys[event.which.toString()] = false;
    }
  }else{
    if(event == "touchup"){
      keys["touch"] = false;
    }
  }

}

function loadKeyReference(){

  function loadC(response){

      var data = Papa.parse(response);

      var keyRef = {};

      for(var i = 0; i < data.data.length; i++){
        keyRef[data.data[i][1]] = data.data[i][0]
      }

  }

  SH.download("keyReference.csv",loadC,SH.load_progress);

};

// store returned list in a variable accessible to the renderer:
function loadImages(image_urls){

  for(var ix = 0; ix < image_urls.length; ix++){

    var img = new Image();
    img.src = image_urls[ix];
    preloaded_images[image_urls[ix]] = img;

  }

  return image_urls

};

// called by the main renderer to get a loaded image:
function retrieveImage(url){
  return preloaded_images[url];
}

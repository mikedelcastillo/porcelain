var porcelain = {
  bowl: {
    count: 10,
    max: 10,
    min: 3
  },
  bowls: [],
  maxVel: 0.2,
  radius: 70,
  friction: 1,
  time: 0,
  sounds: [],
  notes: [
    new Audio("sound/c.mp3"),
    new Audio("sound/e.mp3"),
    new Audio("sound/g.mp3"),
    new Audio("sound/a.mp3"),
    new Audio("sound/c2.mp3")
  ]
};
var view = {};

$(document).ready(function(){
  porcelain.Sound = function(note, volume){
    var self = this;
    this.sound = porcelain.notes[note].cloneNode();
    console.log(note);
    this.sound.play();
    this.sound.volume = volume;
    this.sound.addEventListener("ended", function(){
      var i = porcelain.sounds.indexOf(self);
      porcelain.sounds.splice(i, 1);
    });
  };

  porcelain.sound = function(radius, velocity){
    if(porcelain.sounds.length < 500 && porcelain.time > 120){
      var note = Math.floor((1 - (radius - porcelain.bowl.min) / (porcelain.bowl.max - porcelain.bowl.min)) * porcelain.notes.length);
      var volume = Math.max(0, Math.min(1, velocity * 0.5));
      porcelain.sounds.push(new porcelain.Sound(note, volume));
    }
  };

  view.canvas = $("#canvas").get(0);
  view.renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false
  });

  view.renderer.setClearColor(0xececec);

  view.renderer.shadowMap.enabled = true;
  view.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  view.resize = function(){
    view.renderer.setSize(
      window.innerWidth,
      window.innerHeight)
  };
  view.resize();
  $(window).resize(view.resize);

  view.camera = new THREE.PerspectiveCamera(
    40, view.canvas.width/view.canvas.height,
    0.1, 1000
  );

  view.scene = new THREE.Scene();

  porcelain.Bowl = function(x, z){
    this.x = x;
    this.z = z;

    var theta = Math.random() * Math.PI * 2;

    this.vx = Math.cos(theta) * porcelain.maxVel;
    this.vz = Math.sin(theta) * porcelain.maxVel;

    this.radius = porcelain.bowl.min + Math.random() * (porcelain.bowl.max - porcelain.bowl.min);

    this.geom = new THREE.SphereBufferGeometry(this.radius, 8, 8, 0, Math.PI, 0, Math.PI);
    this.mat = new THREE.MeshStandardMaterial({
      color: 0xFF0000,
      metalness: 0,
      roughness: 1
    });
    this.mat.side = THREE.DoubleSide;

    this.mesh = new THREE.Mesh(this.geom, this.mat);

    this.mesh.position.x = x;
    this.mesh.position.z = z;


    this.mesh.rotation.x += Math.PI/2;
    view.scene.add(this.mesh);
  }

  view.camera.position.z = 0;
  view.camera.position.y = 0;
  view.camera.lookAt(new THREE.Vector3(
    0, -20, 0
  ));

  view.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);


  view.scene.add(view.ambientLight);

  view.pointLight = new THREE.PointLight(0xFFFFFF, 0.8);
  view.pointLight.position.x = view.camera.position.x;
  view.pointLight.position.z = view.camera.position.z;
  view.pointLight.position.y = 10;


  view.scene.add(view.pointLight);

  view.bigBowl = {};
  view.bigBowl.geom = new THREE.SphereBufferGeometry(porcelain.radius, 16, 16, 0, Math.PI, 0, Math.PI);
  view.bigBowl.mat = new THREE.MeshStandardMaterial({
    color: 0xEFEFEF,
    metalness: 0,
    roughness: 1
  });
  view.bigBowl.mat.side = THREE.DoubleSide;
  view.bigBowl.mesh = new THREE.Mesh(view.bigBowl.geom, view.bigBowl.mat);
  view.bigBowl.mesh.rotation.x += Math.PI/2;
  view.bigBowl.mesh.scale.set(1, 1, 0.5);
  view.scene.add(view.bigBowl.mesh);

  view.water = {};
  view.water.geom = new THREE.PlaneGeometry(porcelain.radius * 2, porcelain.radius * 2, 16, 16);
  for(var i = view.water.geom.vertices.length - 1; i >= 0; i--){
    var v = view.water.geom.vertices[i];
    v._x = v.x;
    v._y = v.y;
    v._z = v.z;
    v.w = Math.random();
  }
  view.water.mat = new THREE.MeshStandardMaterial({
    color: 0x00AAff,
    metalness: 0,
    roughness: 1,
    depthTest: false,
    wireframe: true
  });
  view.water.mat.side = THREE.DoubleSide;
  view.water.mesh = new THREE.Mesh(view.water.geom, view.water.mat);
  view.water.mesh.rotation.x += Math.PI/2;

  view.scene.add(view.water.mesh);


  for(var i = 0; i < porcelain.bowl.count; i++){
    var theta = Math.random() * Math.PI * 2;
    var length = Math.random() * porcelain.radius;
    var x = Math.cos(theta) * length;
    var z = Math.sin(theta) * length;
    porcelain.bowls.push(new porcelain.Bowl(x, z));
  }

  porcelain.loop = function(){
    porcelain.time++;

    view.camera.position.z += (200 - view.camera.position.z) / 20;
    view.camera.position.y += (150 - view.camera.position.y) / 20;

    view.camera.lookAt(new THREE.Vector3(
      0, -20, 0
    ));

    for(var i = 0;i < view.water.geom.vertices.length; i++){
      var v = view.water.geom.vertices[i];
      v.z = v._z + ((Math.sin(porcelain.time / 25 + v.w * Math.PI * 2) + 1) / 2) * 10;
    }

    view.water.geom.verticesNeedUpdate = true;

    for(var i = 0; i < porcelain.bowls.length; i++){
      var bowl = porcelain.bowls[i];

      for(var j = 0; j < porcelain.bowls.length; j++){
        var bow2 = porcelain.bowls[j];
        if(bowl != bow2){
          var dx = bowl.x - bow2.x;
          var dz = bowl.z - bow2.z;
          var dist = Math.sqrt(dx * dx + dz * dz);
          var diff = (bowl.radius + bow2.radius - dist) / dist;
          var s1 = (1 / bowl.radius) / ( (1 / bowl.radius) + (1 / bow2.radius));
          var s2 = 1 - s1;

          if(dist < bowl.radius + bow2.radius){
            porcelain.sound(bowl.radius, Math.sqrt(bowl.vx * bowl.vx + bowl.vz * bowl.vz));
            porcelain.sound(bow2.radius, Math.sqrt(bow2.vx * bow2.vx + bow2.vz * bow2.vz));

            bowl.vx += dx * diff * s1;
            bowl.vz += dz * diff * s1;

            bow2.vx -= dx * diff * s2;
            bow2.vz -= dz * diff * s2;
          }
        }
      }

      {
        var theta = Math.atan2(bowl.z, bowl.x);
        var x = Math.cos(theta) * porcelain.radius;
        var z = Math.sin(theta) * porcelain.radius;
        var radius = bowl.radius + 1;
        var dx = bowl.x - x;
        var dz = bowl.z - z;
        var dist = Math.sqrt((dx * dx) + (dz * dz));
        var diff = (radius - dist) / dist;
        var b = 1;
        var d = Math.sqrt((bowl.x * bowl.x) + (bowl.z * bowl.z));

        if(d > porcelain.radius - radius){
          bowl.vx += dx * diff * b;
          bowl.vz += dz * diff * b;

          porcelain.sound(bowl.radius, Math.sqrt(bowl.vx * bowl.vx + bowl.vz * bowl.vz));
        }
      }
    }

    for(var i = 0; i < porcelain.bowls.length; i++){
      var bowl = porcelain.bowls[i];

      var theta = Math.atan2(bowl.vz, bowl.vx);
      var vel = Math.sqrt((bowl.vx * bowl.vx) + (bowl.vz * bowl.vz));
      vel = Math.min(porcelain.maxVel, vel);

      bowl.vx = Math.cos(theta) * vel;
      bowl.vz = Math.sin(theta) * vel;

      bowl.vx *= porcelain.friction;
      bowl.vz *= porcelain.friction;
      bowl.x += bowl.vx;
      bowl.z += bowl.vz;

      bowl.mesh.position.x = bowl.x;
      bowl.mesh.position.z = bowl.z;
    }

    view.renderer.render(view.scene, view.camera);
    requestAnimationFrame(porcelain.loop);
  };

  porcelain.loop();
});

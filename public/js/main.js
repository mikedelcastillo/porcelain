(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-83748025-1', 'auto');
ga('send', 'pageview');

var porcelain = {
  bowl: {
    count: 10,
    max: 13,
    min: 5
  },
  bowls: [],
  maxVel: 0.2,
  radius: 80,
  friction: 1,
  time: 0,
  notes: []
};
var view = {
  pan: 200
};
var mouse = {
  x: 0,
  y: 0
};

jQuery(document).ready(function($){
  $(document.body).on("mousemove", function(e){
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  porcelain.notes = [
    new Howl({src: ["sound/g3.mp3"]}),
    //new Howl({src: ["sound/a3.mp3"]}),
    new Howl({src: ["sound/b3.mp3"]}),
    new Howl({src: ["sound/c4.mp3"]}),
    new Howl({src: ["sound/d4.mp3"]}),
    new Howl({src: ["sound/e4.mp3"]}),
    //new Howl({src: ["sound/f4.mp3"]}),
    new Howl({src: ["sound/g4.mp3"]}),
    //new Howl({src: ["sound/a4.mp3"]}),
    new Howl({src: ["sound/b4.mp3"]}),
    new Howl({src: ["sound/c5.mp3"]})
  ];

  porcelain.sound = function(radius, velocity, x){
    if(porcelain.time > 60){
      var note = Math.floor((1 - (radius - porcelain.bowl.min) / (porcelain.bowl.max - porcelain.bowl.min)) * porcelain.notes.length);
      var volume = Math.max(0, Math.min(1, velocity * 0.75));
      var pan = Math.max(-1, Math.min(1, x / porcelain.radius));
      var howl = porcelain.notes[note];
      var id = howl.play();
      howl.volume(volume, id);
      howl.stereo(pan, id);
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

    view.camera = new THREE.PerspectiveCamera(
      40, view.canvas.width/view.canvas.height,
      0.1, 1000
    );
  };
  view.resize();
  $(window).resize(view.resize);


  view.scene = new THREE.Scene();

  porcelain.Bowl = function(x, z){
    this.x = x;
    this.z = z;

    var theta = Math.random() * Math.PI * 2;

    this.vx = Math.cos(theta) * porcelain.maxVel;
    this.vz = Math.sin(theta) * porcelain.maxVel;

    this.radius = porcelain.bowl.min + Math.random() * (porcelain.bowl.max - porcelain.bowl.min);

    this.geom = new THREE.SphereBufferGeometry(this.radius, 16, 16, 0, Math.PI, 0, Math.PI);
    this.mat = new THREE.MeshStandardMaterial({
      color: 0x2288FF,
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
  view.pointLight.position.y = 10;


  view.scene.add(view.pointLight);

  view.bigBowl = {};
  view.bigBowl.geom = new THREE.SphereBufferGeometry(porcelain.radius, 32, 32, 0, Math.PI, 0, Math.PI);
  view.bigBowl.mat = new THREE.MeshStandardMaterial({
    color: 0xEFEFEF,
    metalness: 0,
    roughness: 1
  });
  view.bigBowl.mat.side = THREE.DoubleSide;
  view.bigBowl.mesh = new THREE.Mesh(view.bigBowl.geom, view.bigBowl.mat);
  view.bigBowl.mesh.rotation.x += Math.PI/2;
  view.bigBowl.mesh.scale.set(1, 1, 1);
  view.scene.add(view.bigBowl.mesh);

  porcelain.bowl.add = function(){
    var theta = Math.random() * Math.PI * 2;
    var length = Math.random() * porcelain.radius;
    var x = Math.cos(theta) * length;
    var z = Math.sin(theta) * length;
    porcelain.bowls.push(new porcelain.Bowl(x, z));
  };

  for(var i = 0; i < porcelain.bowl.count; i++) porcelain.bowl.add();

  porcelain.loop = function(){
    porcelain.time++;

    var pany = ((mouse.y - window.innerHeight / 2) / window.innerHeight / 2) * view.pan;
    var panx = ((mouse.x - window.innerWidth / 2) / window.innerWidth / 2) * view.pan;

    view.camera.position.z += (200 + pany - view.camera.position.z) / 50;
    view.camera.position.y += (150 + pany - view.camera.position.y) / 50;
    view.camera.position.x += (panx * 5 - view.camera.position.x) / 50;

    view.camera.lookAt(new THREE.Vector3(
      0, -20, 0
    ));

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
            porcelain.sound(bowl.radius, Math.sqrt(bowl.vx * bowl.vx + bowl.vz * bowl.vz), bowl.x);
            porcelain.sound(bow2.radius, Math.sqrt(bow2.vx * bow2.vx + bow2.vz * bow2.vz), bow2.x);

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
        var radius = bowl.radius + 0.3;
        var dx = bowl.x - x;
        var dz = bowl.z - z;
        var dist = Math.sqrt((dx * dx) + (dz * dz));
        var diff = (radius - dist) / dist;
        var b = 1;
        var d = Math.sqrt((bowl.x * bowl.x) + (bowl.z * bowl.z));

        if(d > porcelain.radius - radius){
          bowl.vx += dx * diff * b;
          bowl.vz += dz * diff * b;

          porcelain.sound(bowl.radius, Math.sqrt(bowl.vx * bowl.vx + bowl.vz * bowl.vz), bowl.x);
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

  $title = $("#title-wrapper");
  setTimeout(function(){
    porcelain.loop();
    $title.fadeOut(2000);
  }, 2000);
});

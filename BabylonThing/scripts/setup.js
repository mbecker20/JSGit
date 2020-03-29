window.addEventListener('DOMContentLoaded', function(){
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    // createScene function that creates and return the scene
    var createScene = function(){
        var scene = new BABYLON.Scene(engine);
        
        //setup camera
        var camPos = BF.Vec3([37, 20, -22]);
        window.camera = new BABYLON.FlyCamera('camera1', camPos, scene);
        window.camera=setUpFlyCam(window.camera,canvas);
        window.camera.setTarget(BF.Vec3([0,0,0]));

        //setup scene environment
        scene.ambientColor = new BABYLON.Color3(1,1,1);
        scene.clearColor = new BABYLON.Color3(.1,0,.15);

        //setup lights/shadows
        var ambLight = new BABYLON.HemisphericLight('ambLight', new BABYLON.Vector3(0,1,0), scene);

        function ambientIntensity(t, w) {
            return .4*(1+.8*Math.sin(w*t)) //sun rising at t = 0;
        }
        
        var moonLight = new BABYLON.PointLight('moonLight', BF.Vec3([0,30,0]), scene);
        moonLight.intensity = .5
        moonLight.diffuse = Colors.RGB(100,100,100);

        function moonPos(t, r, w) {
            return BF.Vec3([0, -Math.sin(w*t), Math.cos(w*t)]).scale(r);
        }

        var moonShadows = new BABYLON.ShadowGenerator(1024, moonLight);
        moonShadows.usePoissonSampling = true;
        //shadows.useExponentialShadowMap = true;
        //shadows.useBlurExponentialShadowMap = true;

        var sunLight = new BABYLON.PointLight('sunLight', BF.ZeroVec3(), scene);
        sunLight.intensity = .7;
        sunLight.diffuse = Colors.RGB(255,255,153);

        function sunPos(t, r, w) {
            return BF.Vec3([Math.cos(w*t), Math.sin(w*t), 0]).scale(r);
        }
        
        var sunShadows = new BABYLON.ShadowGenerator(1024, sunLight);
        sunShadows.usePoissonSampling = true;

        var shadows = [moonShadows, sunShadows];

        //initialize materials object
        var myMats = new MyMats(scene);

        //create some scene objects
        var moon = BABYLON.MeshBuilder.CreateSphere('moon', {diameter:8, segments:16}, scene);
        moon.material = myMats.moon;
        
        var sun = BABYLON.MeshBuilder.CreateSphere('moon', {diameter:8, segments:16}, scene);
        sun.material = myMats.sun;

        var worldAxes = BF.MakeAxes('worldAxes', scene, 4);

        var underBlock = BABYLON.MeshBuilder.CreateBox('underBlock', {width:40,height:1,depth:40}, scene);
        underBlock.position = BF.Vec3([0,-2,0]);
        underBlock.material = myMats.underBlock;
        underBlock.receiveShadows = true;

        BF.ConnectToShadows(underBlock, shadows);

        BF.ForceCompileMaterials([moon, sun, underBlock]);

        //initialize animation classes
        var anim1 = new Anim1(scene, myMats, shadows);
        anim1.node.position = BF.Vec3([-10, 0, 10]); 

        var anim2 = new Anim2(scene, myMats, shadows);
        anim2.node.position = BF.Vec3([-10, 0, -10])

        var anim3 = new Anim3(scene, myMats, shadows);
        anim3.node.position = BF.Vec3([10, 0, 10])

        //var anim4 = new Anim4(scene, myMats, shadows);
        //anim4.node.position = BF.Vec3([10, 0, -10]);

        //window.anim5 = new Anim5(scene, myMats, shadows);
        //window.anim5.node.position = BF.Vec3([10, 0, -10]);

        var anim6 = new Anim6(scene, myMats, shadows);
        anim6.node.position = BF.Vec3([0,0,20]);

        var anims = [anim1, anim2, anim3, anim6];

        function updateCycle(time, orbitR, orbitW, moonW) {
            ambLight.intensity = ambientIntensity(time, orbitW);

            moon.position = moonPos(time, orbitR, orbitW);
            moonLight.position = moon.position

            sun.position = sunPos(time, orbitR, orbitW);
            sunLight.position = sun.position;
        }

        var time = 0;
        var dt = .01;
        var orbitR = 35;
        var orbitW = .3;
        var moonW = 2;

        updateCycle(time, orbitR, orbitW);

        var testTube = BF.MakeTube('testTube', scene, [0,-2,0], .5);
        testTube.zRotater.position = BF.Vec3([0,15,0]);
        var ball = BF.MakeSphere('ball', {diameter: 1}, scene);
        ball.position = BF.Vec3([0,15,0]);
        testTube.setDirLength([-.8,-2,0])

        scene.registerAfterRender(function () {
            for(var i = 0; i < anims.length; i++) {
                anims[i].step();
            }
            time += dt;
            updateCycle(time, orbitR, orbitW);
            moon.rotation.y += moonW * dt;
        });

        // return the created scene
        return scene;
    }

    // call the createScene function
    var scene = createScene();

    // run the render loop
    engine.runRenderLoop(function(){
        scene.render();
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
        engine.resize();
    });
});
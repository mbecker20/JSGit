window.addEventListener('DOMContentLoaded', function(){
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    // createScene function that creates and return the scene
    var createScene = function(){
        var scene = new BABYLON.Scene(engine);
        
        //setup camera
        //var camPos = BF.Vec3([37, 20, -22]);
        var camPos = BF.Vec3([32, 19, -30]);
        window.camera = new BABYLON.FlyCamera('camera1', camPos, scene);
        window.camera=setUpFlyCam(window.camera, canvas);
        window.camera.setTarget(BF.Vec3([0,0,0]));
        //window.camera.setTarget(BF.Vec3([0,7,20]));

        //setup scene environment
        scene.ambientColor = Colors.RGB(255,255,255);
        scene.clearColor = Colors.RGB(0,0,0);

        //setup lights/shadows
        var ambLight = new BABYLON.HemisphericLight('ambLight', new BABYLON.Vector3(0,1,0), scene);

        function ambientIntensity(t, w) {
            return .4*(1+.6*Math.sin(w*t)) //sun rising at t = 0;
        }
        
        var moonPos = BF.ZeroVec3();
        var moonLight = new BABYLON.PointLight('moonLight', moonPos, scene);
        moonLight.intensity = .5
        moonLight.diffuse = Colors.RGB(100,100,100);

        function moonPosition(t, r, w, moonPos) {
            return BF.SetVec3([0, -Math.sin(w*t), Math.cos(w*t)], moonPos).scale(r);
        }
 
        var shadowQual = 1024 // 512 or 1024 for laptop, 2048 for desktop

        var moonShadows = new BABYLON.ShadowGenerator(shadowQual, moonLight);
        moonShadows.usePoissonSampling = true;
        //moonShadows.useExponentialShadowMap = true;
        //moonShadows.useBlurExponentialShadowMap = true;

        var sunPos = BF.ZeroVec3()
        var sunLight = new BABYLON.PointLight('sunLight', BF.ZeroVec3(), scene);
        sunLight.intensity = .7;
        sunLight.diffuse = Colors.RGB(255,255,153);

        function sunPosition(t, r, w, sunPos) {
            return BF.SetVec3([Math.cos(w*t), Math.sin(w*t), 0], sunPos).scale(r);
        }
        
        var sunShadows = new BABYLON.ShadowGenerator(shadowQual, sunLight);
        sunShadows.usePoissonSampling = true;
        //sunShadows.useExponentialShadowMap = true;

        var shadows = [moonShadows, sunShadows];

        //initialize materials object
        var myMats = new MyMats(scene);

        //make skybox
        var skyBox = new BABYLON.MeshBuilder.CreateBox('skybox', {size: 1000}, scene);
        skyBox.material = myMats.skyBox;

        //create sun and moon meshs
        var moon = BABYLON.MeshBuilder.CreateSphere('moon', {diameter:8, segments:16}, scene);
        moon.material = myMats.moon;
        
        var sun = BABYLON.MeshBuilder.CreateSphere('moon', {diameter:8, segments:16}, scene);
        sun.material = myMats.sun;

        //place axes at origin for reference during development
        //var worldAxes = BF.MakeAxes('worldAxes', scene, 4);

        var underBlock = BABYLON.MeshBuilder.CreateBox('underBlock', {width:40,height:1,depth:40}, scene);
        underBlock.position = BF.Vec3([0,-2,0]);
        underBlock.material = myMats.darkMoon;
        underBlock.receiveShadows = true;

        BF.ConnectToShadows(underBlock, shadows);

        BF.ForceCompileMaterials([moon, sun, underBlock, skyBox]);

        var grid = BF.MakeGridXZ([-10,0,-10], 20, 2, 2);

        //initialize animation classes
        //var anim1 = new Anim1(scene, myMats, shadows);
        //anim1.node.position = grid[0][1]; 

        //var anim2 = new Anim2(scene, myMats, shadows);
        //anim2.node.position = grid[1];

        //var anim3 = new Anim3(scene, myMats, shadows);
        //anim3.node.position = grid[0][0];

        //var anim4 = new Anim4(scene, myMats, shadows);
        //anim4.node.position = grid[1][1];

        //var anim5 = new Anim5(scene, myMats, shadows);
        //anim5.node.position = grid[1][0];

        var anim6 = new Anim6(scene, myMats, shadows);
        anim6.node.position = BF.Vec3([0,0,20]);

        var anim7 = new Anim7(scene, myMats, shadows);
        //anim7.node.position = grid[1][0];

        var anims = [anim7, anim6];

        function updateCycle(time, orbitR, orbitW) {
            ambLight.intensity = ambientIntensity(time, orbitW);

            moon.position = moonPosition(time, orbitR, orbitW, moonPos);
            moonLight.position = moon.position

            sun.position = sunPosition(time, orbitR, orbitW, sunPos);
            sunLight.position = sun.position;
        }

        var time = 0;
        var dt = .01;
        var orbitR = 35;
        var orbitW = .2;
        var moonW = .5;
        var skyW = .02;

        updateCycle(time, orbitR, orbitW);

        scene.registerAfterRender(function () {
            for(var i = 0; i < anims.length; i++) {
                anims[i].step();
            }
            time += dt;
            updateCycle(time, orbitR, orbitW);
            moon.rotation.y += moonW * dt;
            skyBox.rotation.y += skyW *dt;
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
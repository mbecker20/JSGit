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
        var camPos = BF.Vec3([22, 16, -22]);
        window.camera = new BABYLON.FlyCamera('camera1', camPos, scene);
        window.camera=setUpFlyCam(window.camera, canvas);
        window.camera.setTarget(BF.Vec3([0,7,0]));
        //window.camera.setTarget(BF.Vec3([0,7,20]));

        //setup scene environment
        scene.ambientColor = Colors.RGB(255,255,255);
        scene.clearColor = Colors.RGB(0,0,0);

        //initialize materials object
        var myMats = new MyMats(scene);

        //setup gui
        window.gui = UI.MakeGUI(canvas);

        //var grid = BF.MakeGridXZ([-10,0,-10], 20, 2, 2);

        //initialize animation classes
        var shadowQual = 1024;
        var cycle = new Cycle(scene, myMats, shadowQual);

        var spinningRing = new SpinningRing(scene, myMats, cycle.shadows, window.gui);

        var anims = { 
            'mass on a ring': spinningRing
        };

        var animState = {activeAnim: spinningRing, anims: anims};

        window.gui.mainMenu.addControl(spinningRing.guiMenu.parentButton);
        UI.MakeHowToMenu(window.gui);

        scene.registerAfterRender(function () {
            cycle.step();
            animState.activeAnim.step();
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
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
        window.camera.setTarget(BF.Vec3([0,4,0]));
        //window.camera.setTarget(BF.Vec3([0,7,20]));

        //setup scene environment
        scene.ambientColor = Colors.RGB(255,255,255);
        scene.clearColor = Colors.RGB(0,0,0);

        //initialize materials object
        var myMats = new MyMats(scene);

        //setup gui
        window.gui = UI.MakeGUI(canvas);

        var grid = BF.MakeGridXZ([-10,0,-10], 20, 2, 2);

        //initialize animation classes
        var shadowQual = 1024;
        var cycle = new Cycle(scene, myMats, shadowQual);

        var bouncyBall = new BouncyBall(scene, myMats, cycle.shadows, window.gui);
        bouncyBall.deactivate();

        //var anim2 = new Anim2(scene, myMats, shadows);
        //anim2.node.position = grid[1];

        //var anim3 = new Anim3(scene, myMats, shadows);
        //anim3.node.position = grid[0][0];

        var dancingTHandle = new DancingTHandle(scene, myMats, cycle.shadows, window.gui);
        dancingTHandle.deactivate();
        //anim4.node.position = grid[1][1];

        //var anim5 = new Anim5(scene, myMats, shadows);
        //anim5.node.position = grid[1][0];

        //var anim6 = new Anim6(scene, myMats, shadows);
        //anim6.node.position = BF.Vec3([0,0,20]);

        var ptw = new PendTugOfWar(scene, myMats, cycle.shadows, window.gui);
        //anim7.node.position = grid[1][0];

        var spinningRing = new SpinningRing(scene, myMats, cycle.shadows, window.gui);
        spinningRing.deactivate();

        var anims = {
            'pendulum tug of war': ptw, 
            'mass on a ring': spinningRing, 
            'bouncy ball': bouncyBall,
            'dancing T handle': dancingTHandle
        };

        var animState = {activeAnim: ptw, anims: anims};

        var caMenu = UI.MakeChooseAnimMenu(animState, window.gui);

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
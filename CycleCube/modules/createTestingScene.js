var createTestingScene = function(canvas, engine) {
    // create scene
    // scene with only cycle for testing
    var scene = new BABYLON.Scene(engine);

    //initialize sounds object
    window.sounds = new MySounds(scene);

    // create gui
    window.gui = UI.MakeGUI(canvas);

    // create pointerManager to manage mouse/touch interactions
    window.pointerManager = new PointerManager(scene);

    // create funcBuffer for keyed animations
    window.funcBuffer = new FuncBuffer();

    // setup camera
    var camPos = BF.Vec3([22, Cycle.UNDERBLOCKSIZE()/2+Cam.HEIGHT()+1, -22]);
    window.camera = Cam.MakeCam(camPos, scene, canvas, engine);
    //window.camera.setLookDirection([-1,5,0]);
    window.camera.lookAt([0,Cycle.UNDERBLOCKSIZE()/2,0]);

    //setup scene environment
    scene.ambientColor = BF.ColorRGB(255,255,255);
    scene.clearColor = BF.ColorRGB(0,0,0);

    //initialize materials object
    window.myMats = new MyMats(scene);

    //initialize animation classes
    var shadowQual = 1024;
    var cycle = new Cycle(scene, window.myMats, shadowQual);
    window.camera.ground = cycle.underBlock;

    // world axes for reference (red = x, green = y, blue = z)
    var oAxes = BF.MakeAxes('oAxes', scene, 4);
    oAxes.position.y = Cycle.UNDERBLOCKSIZE()/2 + .5;

    // do testing stuff here
    var slider = UI3D.MakeSphereSlider('sphereSlider', scene, 1, cycle.underBlock, [0,10], 5, 20, GF.DoNothing);
    slider.node.position = BF.Vec3([0, Cycle.UNDERBLOCKSIZE()/2, -10]);
    slider.addToPointerManager('posy');
    slider.addText('testing');
    slider.mesh.material = window.myMats.sun;

    //var risingBox = UI3D.MakeRisingBox('risingBox', scene, 6, 6, 1);
    //risingBox.node.position.y = Cycle.UNDERBLOCKSIZE()/2;

    function test(a, b, ...args) {
        console.log(a);
        console.log(b);
        console.log(args);
    };

    test(1,2,3,4,5);


    UI.MakeChooseVirtualControlMenu(window.gui);
    UI.MakeHowToMenu(window.gui);
    UI.MakeVolumeSliderPanel(window.gui);
    BF.SetGlobalVolume(0);

    scene.registerAfterRender(function() {
        window.camera.step();
        cycle.step();
        window.funcBuffer.exist();
    });

    return scene;
}

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

    var risingBox = UI3D.MakeRisingBox('risingBox', scene, 6, 6, 1);
    risingBox.node.position.y = Cycle.UNDERBLOCKSIZE()/2;
    /*
    var plane = UI3D.MakeTextPlane('planetest', scene, 10, 10, 'testing testing', 150);
    plane.parent = slider.node;
    plane.position.z = -3;
    plane.position.y = .1;
    plane.rotation.x = Math.PI/2;
    */

    UI.MakeChooseVirtualControlMenu(window.gui);
    UI.MakeHowToMenu(window.gui);
    UI.MakeVolumeSliderPanel(window.gui);
    BF.SetGlobalVolume(0);

    scene.registerAfterRender(function() {
        window.camera.step();
        cycle.step();
    });

    return scene;
}

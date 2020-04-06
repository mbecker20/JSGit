class Anim1 {
    constructor(scene, myMats, shadows, gui) {
        this.node = new BABYLON.TransformNode('anim1Node', scene);

        this.r=3;
        this.sphere = BABYLON.MeshBuilder.CreateSphere('sphere1', {segments:16, diameter:2}, scene);
        this.sphere.position = BF.Vec3([0, 2*this.r, 0]);
        this.sphere.material = myMats.darkMoon;
        this.sphere.receiveShadows = true;

        this.ground = BABYLON.MeshBuilder.CreateGround('ground1', {width:20,height:20}, scene);
        this.ground.position = BF.ZeroVec3();
        this.ground.material = myMats.wArrow;
        this.ground.receiveShadows = true;

        BF.SetChildren(this.node, [this.sphere, this.ground]);
        BF.ConnectMeshsToShadows([this.sphere, this.ground], shadows);
        BF.ForceCompileMaterials([this.sphere, this.ground]);

        this.scaling = new BABYLON.Vector3(this.r,this.r,this.r);

        this.g = -10; //already negative
        this.y=this.sphere.position.y;
        this.v=10;
        this.k=50;
        this.dt=.01;
        this.stepsPerFrame=1;

        this.oscY=0;
        this.oscV=0;
        this.damping=2;

        this.deltaRot=.02

        this.groundVUp=Math.sqrt(this.v*this.v-2*this.g*(this.sphere.position.y-1));

        this.onGround=false;

        this.setupGUIMenu(gui, this);
    }

    step() {
        for(var i=0; i<this.stepsPerFrame; i++) {
            var distance = this.v * this.dt;
            if(!this.onGround) {
                if(this.y<=this.r) {
                    this.onGround=true;
                    this.stepOnGround(this.y);
                } else {
                    this.y += distance;
                    this.v += this.g*this.dt;
                    this.stepOsc();
                }
            } else {
                if(this.y<=this.r) {
                    this.stepOnGround(this.y);
                } else {
                    this.onGround=false;
                    this.y+=distance;
                    this.v=this.groundVUp;
                    this.oscY=0;
                    this.oscV=this.v
                    //this.v += this.g*this.dt;
                    this.stepOsc();
                }
            }
        }
        this.updateSphere();
    }

    updateSphere() {
        this.sphere.position.y=this.y;
        this.sphere.rotation.y+=this.deltaRot;
        if(this.onGround) {
            this.setScalingOnG(this.y);
        } else {
            this.setScalingOffG();
        }
    }

    stepOnGround(y) {
        const stepYV = VF.rk4(this.onGroundDerivs, this, [this.y,this.v], this.dt);
        this.y=stepYV[0];
        this.v=stepYV[1];
    }

    onGroundDerivs(y,v,params) {
        const a=params.k*(params.r - y) + params.g;
        return [v,a];
    }

    setScalingOnG(y) {
        //const xzScale=(3/2)-(y/2);
        const xzScale=2*this.r-y;
        this.scaling.set(xzScale,y,xzScale);
        this.sphere.scaling=this.scaling;
    }

    stepOsc() {
        const stepYV=VF.rk4(this.oscDerivs, this, [this.oscY,this.oscV], this.dt);
        this.oscY = stepYV[0];
        this.oscV = stepYV[1];
    }

    oscDerivs(y,v,params) {
        const a = -params.k*y - params.damping*v;
        return [v,a];
    }

    setScalingOffG() {
        const yScale=this.r+this.oscY;
        //const xzScale=1-.5*this.oscY;
        const xzScale=this.r-this.oscY;
        this.scaling.set(xzScale,yScale,xzScale);
        this.sphere.scaling=this.scaling;
    }

    setupGUIMenu(gui, anim) {
        this.guiMenu = UI.MakeSubMenu('sim settings', gui.mainMenu, gui);

        var kSlider = UI.MakeSliderPanel('springiness', '', 32, 400, anim.k, function(value) {
            anim.k = value;
        });

        var dampingSlider = UI.MakeSliderPanel('damping', '', 0, 2, anim.damping, function(value) {
            anim.damping = value;
        });

        this.guiMenu.addControls([kSlider, dampingSlider, UI.MakeVertSpacer()]);
    }

    activate() {
        this.node.setEnabled(true);
        this.guiMenu.parentButton.isVisible = true;
    }

    deactivate() {
        this.node.setEnabled(false);
        this.guiMenu.parentButton.isVisible = false;
    }
}

class Anim2 {
    constructor(scene, myMats, shadows) {
        this.node = new BABYLON.TransformNode('anim2Node', scene);

        this.ground = BABYLON.MeshBuilder.CreateGround('ground2', {width:10,height:10}, scene);
        this.ground.position = BF.ZeroVec3();
        this.ground.material = myMats.blue;
        this.ground.receiveShadows = true;

        this.cube = BABYLON.MeshBuilder.CreateBox('box', {width:2,height:1,depth:4}, scene);
        this.cube.material = myMats.bwPattern;
        this.cube.receiveShadows = true;
        
        BF.ConnectMeshsToShadows([this.cube, this.ground], shadows);

        var showWArrow = true;
        var showAxes = true;
        this.dt = .002;
        this.cube = makePhysBody(scene, this.cube, BF.ZeroVec3(), [2000,100,50], 1, this.dt, showWArrow, showAxes);
        this.cube.p = BF.Vec3([0, 5, 0]);
        this.cube.position = BF.Vec3([0, 5, 0]);
        this.cube.wArrow.pointer.material = myMats.wArrow;
        this.cube.updateMesh();

        BF.SetChildren(this.node, [this.ground, this.cube, this.cube.wArrow])

        this.stepsPerFrame = 1;
        this.g = 0;

        BF.ForceCompileMaterials([this.cube, this.cube.wArrow.pointer, this.ground]);
    }

    step() {
        for(var i=0; i<this.stepsPerFrame; i++) {
            this.cube.step(this.g, this.dt);
        }
        this.cube.updateMesh();
    }
}

class Anim3 {
    // rotating ring with derived diff eq
    constructor(scene, myMats, shadows) {
        // make local origin of anim
        this.node = new BABYLON.TransformNode('anim3Node', scene);

        // set initial parameters
        this.theta = 0.2; // mass position around ring
        this.thetaDot = 4;
        this.phi = 0; // total ring rotation
        this.omega = 2; // ring rotation speed, omega = d(phi)/dt, is constant
        this.damping = 0.05;

        this.dt = .03;
        this.stepsPerFrame = 1;

        // setup objects
        this.ground = BABYLON.MeshBuilder.CreateGround('ground4', {width:10,height:10}, scene);
        this.ground.receiveShadows = true;

        this.ringRad = 4;
        this.ring = BABYLON.MeshBuilder.CreateTorus('ring', {diameter:2*this.ringRad,thickness:.25, tessellation:64}, scene);
        this.ring.rotation.x = Math.PI/2;
        this.ring.bakeCurrentTransformIntoVertices();
        this.ring.position = BF.Vec3([0,5,0]);
        this.ring.receiveShadows = true;

        this.mass = BABYLON.MeshBuilder.CreateSphere('ringMass', {segments:16, diameter:1.5}, scene);
        this.mass.parent = this.ring;
        this.mass.receiveShadows = true;

        // set object materials
        this.ground.material = myMats.wArrow;
        this.ring.material = myMats.wArrow;
        this.mass.material = myMats.darkMoon;

        BF.SetChildren(this.node, [this.ground, this.ring]);
        BF.ConnectMeshsToShadows([this.ring, this.mass, this.ground], shadows);
        BF.ForceCompileMaterials([this.ring, this.mass, this.ground]);

        this.updateMesh();
    }

    step() {
        for(var i = 0; i<this.stepsPerFrame; i++) {
            const stepped = VF.rk4(this.stepDerivs, this, [this.theta,this.thetaDot], this.dt);
            this.theta = stepped[0];
            this.thetaDot = stepped[1];
            this.phi += this.omega * this.dt;
        }
        this.updateMesh();
    }

    stepDerivs(theta,thetaDot,params) {
        const thetaDD = Math.sin(theta) * (Math.pow(params.omega, 2) * Math.cos(theta) - 1) - params.damping * thetaDot;
        return [thetaDot,thetaDD];
    }

    updateMesh() {
        BF.SetVec3(math.multiply([Math.sin(this.theta),-Math.cos(this.theta),0],this.ringRad), this.mass.position);
        this.ring.rotation.y = this.phi;
    }
}

class Anim4 {
    constructor(scene, myMats, shadows, gui) {
        this.node = new BABYLON.TransformNode('anim4Node', scene);

        this.ground = BABYLON.MeshBuilder.CreateGround('ground4', {width:20,height:20}, scene);
        this.ground.position = BF.ZeroVec3();
        this.ground.material = myMats.wArrow;
        this.ground.receiveShadows = true;

        var mainLength = 6;
        var mainDiameter = 2;
        var crossLength = 8;
        var crossDiameter = 2;

        this.tHandle = BF.MakeTHandle('tHandle', scene, mainLength, mainDiameter, crossLength, crossDiameter);
        this.tHandle.material = myMats.darkMoon;
        this.tHandle.receiveShadows = true;

        BF.ConnectMeshsToShadows([this.tHandle, this.ground], shadows);

        this.dt = .008;
        this.g = 0;

        makePhysBody(scene, this.tHandle, BF.ZeroVec3(), [80,80,1200], .1, this.dt);
        this.tHandle.p = BF.Vec3([0, 7, 0]);
        this.tHandle.position = this.tHandle.p;
        this.tHandle.wArrow.pointer.material = myMats.wArrow;
        this.tHandle.updateMesh();

        BF.SetChildren(this.node, [this.ground, this.tHandle, this.tHandle.wArrow]);
        
        this.stepsPerFrame = 1;

        BF.ForceCompileMaterials([this.tHandle, this.tHandle.wArrow.pointer, this.ground]);

        this.setupGUIMenu(gui, this);
    }

    step() {
        for(var i=0; i<this.stepsPerFrame; i++) {
            this.tHandle.step(this.g, this.dt);
        }
        this.tHandle.updateMesh();
    }

    setupGUIMenu(gui, anim) {
        this.guiMenu = UI.MakeSubMenu('sim settings', gui.mainMenu, gui);

        var showWArrowButton = UI.MakeDualTextButton('showWArrowBut', 'show axis of rotation', 'hide axis of rotation', function() {
            anim.tHandle.showWArrow = !anim.tHandle.showWArrow;
            anim.tHandle.setShowWArrow(anim.tHandle.showWArrow);
        });

        var showAxesButton = UI.MakeDualTextButton('showAxesBut', 'show body axes', 'hide body axes', function() {
            anim.tHandle.showAxes = !anim.tHandle.showAxes;
            anim.tHandle.setShowAxes(anim.tHandle.showAxes);
        });

        this.guiMenu.addControls([showWArrowButton, showAxesButton, UI.MakeVertSpacer()]);
    }

    activate() {
        this.node.setEnabled(true);
        this.guiMenu.parentButton.isVisible = true;
    }

    deactivate() {
        this.node.setEnabled(false);
        this.guiMenu.parentButton.isVisible = false;
    }
}

class Anim5 {
    constructor(scene, myMats, shadows) {
        // sphere swings, cube up and down
        this.node = new BABYLON.TransformNode('anim4Node', scene);

        // setup lagrangian update system
        function lFunc(p, pConst) {
            var t1 = (1/2)*(pConst.mSphere + pConst.mCube)*MF.Square(p.lDot);
            var t2 = (1/2)*pConst.mSphere*MF.Square(p.l*p.thetaDot);
            var t3 = pConst.g*p.l*(pConst.mSphere*Math.cos(p.theta) - pConst.mCube);
            return t1 + t2 + t3;
        }

        this.dt = .01;
        this.stepsPerFrame = 2;
        this.params = {l: 8, lDot: 3, theta: 1, thetaDot: 2};
        this.pConst = {mSphere: 1.3, mCube: 1.5, g: 10};
        this.lTot = 10;
        this.damping = {lDot: .01, thetaDot: .01};
        this.lagrangian = new SplitLagrangian(this.getLFuncs(), this.params, this.pConst, this.damping);

        // setup meshes
        this.setupMeshs(scene);

        // set materials
        this.setMaterials(myMats);

        // connect meshs to shadows and force pre-compile materials
        BF.ConnectMeshsToShadows([this.ground, this.sphere, this.cube, this.spherePiv, this.cubePiv, this.topRope, this.sphereRope, this.cubeRope], shadows);
        BF.ForceCompileMaterials([this.topRope, this.ground, this.sphere, this.cube, this.spherePiv, this.cubePiv]);

        // set BC
        this.lMin = this.spherePivR + this.sphereR;
        this.lMax = this.lTot - this.cubePivR - this.cubeR;

        // set initial position of everything
        this.setPos();
    }

    getLFuncs() {
        function t0(p, pConst) {
            this.paramKeys = ['lDot'];
            return .5*(pConst.mSphere + pConst.mCube)*MF.Square(p.lDot);
        }

        function t1(p, pConst) {
            this.paramKeys = ['l', 'thetaDot'];
            return .5*pConst.mSphere*MF.Square(p.l*p.thetaDot);
        }

        function t2(p, pConst) {
            this.paramKeys = ['l', 'theta'];
            return pConst.g*p.l*(pConst.mSphere*Math.cos(p.theta) - pConst.mCube);
        }

        return [t0, t1, t2];
    }

    setPos() {
        var cubeSideLength = (this.lTot - this.params.l)
        var spherePos = math.multiply([Math.sin(this.params.theta), -Math.cos(this.params.theta), 0], this.params.l);
        this.cube.position.y = -cubeSideLength;
        this.cubeRope.scaling.y = cubeSideLength;

        this.sphere.position = BF.Vec3(spherePos);
        this.sphere.rotation.z = this.params.theta;
        this.sphereRope.scaling.y = this.params.l;
        this.sphereRope.rotation.z = this.params.theta;
    }

    step() {
        this.lagrangian.step(this.dt, this.stepsPerFrame);
        this.imposeBC();
        this.setPos();
    }

    imposeBC() {
        // updates params based on boundary conditions
        if(this.params.l > this.lMax) {
            this.params.l = this.lMax;
            this.params.lDot = this.lagrangian.pDD.l * this.dt;
        } else if(this.params.l < this.lMin) {
            this.params.l = this.lMin;
            this.params.lDot = this.lagrangian.pDD.l * this.dt;
        }
    }

    setupMeshs(scene) {
        this.ground = BABYLON.MeshBuilder.CreateGround('ground4', {width:10,height:10}, scene);
        this.ground.receiveShadows = true;

        this.sphereR = 1;
        this.sphere = BF.MakeSphere('sphere5', scene, 2 * this.sphereR);

        this.cubeR = 1;
        this.cube = BABYLON.MeshBuilder.CreateBox('cube5', {size: 2 * this.cubeR}, scene);
        this.cube.receiveShadows = true;

        this.spherePivR = .5
        this.spherePiv = BF.MakeCylinder('spherePiv', scene, .5, 2 * this.spherePivR);
        this.spherePiv.rotation.x = Math.PI/2;
        
        this.cubePivR = .5;
        this.cubePiv = BF.MakeCylinder('cubePiv', scene, .5, 2 * this.cubePivR);
        this.cubePiv.rotation.x = Math.PI/2;

        BF.BakeMeshs([this.spherePiv, this.cubePiv]);

        this.spherePiv.position = BF.Vec3([0, 12, -2]);
        this.cubePiv.position = BF.Vec3([0, 12, 2]);
        
        this.topRope = BF.MakeTube('topRope', scene, .25);
        this.topRope.scaling.x = 4;
        this.topRope.rotation.y = -Math.PI/2;

        this.sphereRope = BF.MakeTube('sphereRope', scene, .25);
        this.sphereRope.rotation.z = -Math.PI/2;

        this.cubeRope = BF.MakeTube('cubeRope', scene, .25);
        this.cubeRope.rotation.z = -Math.PI/2;
        
        BF.BakeMeshs([this.cubeRope, this.sphereRope]); // have to set length with scaling.y;

        // setup Parenting
        BF.SetChildren(this.node, [this.ground, this.spherePiv, this.cubePiv, this.topRope]);
        BF.SetChildren(this.spherePiv, [this.sphere, this.topRope, this.sphereRope]);
        BF.SetChildren(this.cubePiv, [this.cube, this.cubeRope]);
    }

    setMaterials(myMats) {
        this.ground.material = myMats.wArrow;
        this.sphere.material = myMats.darkMoon;
        this.cube.material = myMats.darkMoon;
        this.spherePiv.material = myMats.darkMoon;
        this.cubePiv.material = myMats.darkMoon;
        this.topRope.material = myMats.wArrow;
        this.sphereRope.material = myMats.wArrow;
        this.cubeRope.material = myMats.wArrow;
    }
}

class Anim6 {
    //double pendulum 
    constructor(scene, myMats, shadows) {
        // initialized node used as local origin for this anim
        this.node = BF.MakeTransformNode('node6', scene);

        // set up Lagrangian Physics update system by defining the lagrangian function
        function lFunc(p, pConst) {
            var t1 = (1/2)*(pConst.m1 + pConst.m2)*MF.Square(pConst.l1*p.thetaDot);
            var t2 = (1/2)*pConst.m2*(MF.Square(pConst.l2*p.phiDot) + 2*pConst.l1*pConst.l2*Math.cos(p.theta-p.phi)*p.thetaDot*p.phiDot);
            var t3 = (pConst.m1 + pConst.m2)*pConst.g*pConst.l1*Math.cos(p.theta);
            var t4 = pConst.m2*pConst.g*pConst.l2*Math.cos(p.phi);
            return t1 + t2 + t3 + t4;
        }

        //setup parameters used by Lagrangian system;
        this.params = {theta: 4, thetaDot: -1, phi: 5, phiDot: 0};
        this.pConst = {m1: 2, m2: 2, l1: 5, l2: 4, g:10};
        this.damping = {thetaDot: 0, phiDot: 0};
        this.lagrangian = new SplitLagrangian(this.getLFuncs(), this.params, this.pConst, this.damping, .01);

        this.dt = .008;
        this.stepsPerFrame = 2;

        // initialize meshes
        this.setupMeshs(scene);

        // set materials
        this.setMaterials(myMats);

        BF.ForceCompileMaterials([this.sphere, this.m1, this.m2, this.l1, this.l2]);
        BF.ConnectMeshsToShadows([this.sphere, this.m1, this.m2, this.l1, this.l2], shadows);

        this.setPos();
    }

    step() {
        this.lagrangian.stepCorrected(this.dt, this.stepsPerFrame);
        this.setPos();
    }

    getLFuncs() {
        function l0(p, pConst) {
            return .5*(pConst.m1 + pConst.m2)*MF.Square(pConst.l1*p.thetaDot);
        }
        l0.paramKeys = ['thetaDot'];
        function l1(p, pConst) {
            return .5*pConst.m2*MF.Square(pConst.l2*p.phiDot);
        }
        l1.paramKeys = ['phiDot'];
        function l2(p, pConst) {
            return pConst.m2*pConst.l1*pConst.l2*Math.cos(p.theta-p.phi)*p.thetaDot*p.phiDot;
        }
        l2.paramKeys = ['theta', 'phi', 'thetaDot', 'phiDot'];
        function l3(p, pConst) {
            return (pConst.m1 + pConst.m2)*pConst.g*pConst.l1*Math.cos(p.theta);
        }
        l3.paramKeys = ['theta'];
        function l4(p, pConst) {
            return pConst.m2*pConst.g*pConst.l2*Math.cos(p.phi);
        }
        l4.paramKeys = ['phi'];

        return [l0, l1, l2, l3, l4]
    }

    setPos() {
        var m1Pos = math.multiply([Math.sin(this.params.theta), -Math.cos(this.params.theta), 0], this.pConst.l1);
        var m2RelPos = math.multiply([Math.sin(this.params.phi), -Math.cos(this.params.phi), 0], this.pConst.l2);
        var m2Pos = math.add(m1Pos, m2RelPos);
        this.m1.position = BF.Vec3(m1Pos);
        this.m1.rotation.z = this.params.theta;
        this.l1.rotation.z = this.params.theta;

        this.m2.position = BF.Vec3(m2Pos);
        this.m2.rotation.z = this.params.phi;
        this.l2.position = this.m1.position;
        this.l2.rotation.z = this.params.phi;
    }

    setupMeshs(scene) {
        this.sphere = BF.MakeSphere('sphere6', scene, 1); // the anchor of the double pend
        this.sphere.position.y = 15;

        this.m1 = BF.MakeCylinder('cylinder61', scene, .5, Math.sqrt(this.pConst.m1));
        this.m1.rotation.x = Math.PI/2;

        this.m2 = BF.MakeCylinder('cylinder61', scene, .5, Math.sqrt(this.pConst.m2));
        this.m2.rotation.x = Math.PI/2;

        this.l1 = BF.MakeTube('l1', scene, .25);
        this.l1.scaling.x = this.pConst.l1;
        this.l1.rotation.z = -Math.PI/2;

        this.l2 = BF.MakeTube('l2', scene, .25);
        this.l2.scaling.x = this.pConst.l2;
        this.l2.rotation.z = -Math.PI/2; // orients tube along -y axis;

        BF.BakeMeshs([this.m1, this.m2, this.l1, this.l2]);

        // use sphere as origin for rest of objects, force compile materials, connect meshs to shadows
        BF.SetChildren(this.node, [this.sphere]);
        BF.SetChildren(this.sphere, [this.m1, this.m2, this.l1, this.l2]);
    }

    setMaterials(myMats) {
        this.sphere.material = myMats.darkMoon;
        this.m1.material = myMats.darkMoon;
        this.m2.material = myMats.darkMoon;
        this.l1.material = myMats.wArrow;
        this.l2.material = myMats.wArrow;
    }
}

class Anim7 {
    constructor(scene, myMats, shadows, gui) {
        // sphere swings, cube up and down
        this.node = BF.MakeTransformNode('anim7Node', scene);

        // setup lagrangian update system
        this.dt = .01;
        this.stepsPerFrame = 2;
        this.params = {l: 6, lDot: 3, theta: 1, thetaDot: 2, phi: 0, phiDot: 10};
        this.pConst = {mSphere: 1.1, mCube: 1, g: 10, lTot: 10, rSphere: 1, sCube: 2};
        this.damping = {lDot: .01, thetaDot: .01, phiDot: .01};
        this.pConst.sphereIcm = this.pConst.mSphere * (2/5) * MF.Square(this.pConst.rSphere);
        this.pConst.cubeIcm = this.pConst.mCube * (1/6) * MF.Square(this.pConst.sCube);

        this.lagrangian = new SplitLagrangian(this.getLFuncs(), this.params, this.pConst, this.damping);
        this.collisionVelocityMult = .6; // multiplied by -velocity on collision with pivot;

        // setup meshes
        this.setupMeshs(scene);
        
        // set materials
        this.setMaterials(myMats);

        // connect meshs to shadows and force pre-compile materials
        BF.ConnectMeshsToShadows([this.ground, this.sphere, this.cube, this.spherePiv, this.cubePiv, this.topRope, this.sphereRope, this.cubeRope], shadows);
        BF.ForceCompileMaterials([this.topRope, this.ground, this.sphere, this.cube, this.spherePiv, this.cubePiv]);

        // set BC
        this.lMin = this.spherePivR + this.pConst.rSphere;
        this.lMax = this.pConst.lTot - this.cubePivR - this.pConst.sCube/2;

        // set initial position of everything
        this.setPos();
        this.setupGUIMenu(gui, this);
    }

    setMaterials(myMats) {
        this.ground.material = myMats.wArrow;
        this.sphere.material = myMats.darkMoon;
        this.cube.material = myMats.darkMoon;
        this.spherePiv.material = myMats.darkMoon;
        this.cubePiv.material = myMats.darkMoon;
        this.topRope.material = myMats.wArrow;
        this.sphereRope.material = myMats.wArrow;
        this.cubeRope.material = myMats.wArrow;
    }

    getLFuncs() {
        function l0(p, pConst) {
            return .5 * (pConst.mSphere + pConst.mCube) * MF.Square(p.lDot);
        }
        l0.paramKeys = ['lDot'];
        
        function l1 (p, pConst) {
            var sphereI = pConst.sphereIcm + pConst.mSphere * MF.Square(p.l);
            return .5 * sphereI * MF.Square(p.thetaDot);
        }
        l1.paramKeys = ['l', 'thetaDot'];

        function l2 (p, pConst) {
            var cubeI = pConst.cubeIcm + pConst.mCube * MF.Square(pConst.lTot - p.l);
            return .5 * cubeI * MF.Square(p.phiDot);
        }
        l2.paramKeys = ['l', 'phiDot'];

        function l3 (p, pConst) {
            return pConst.mSphere * pConst.g * p.l * Math.cos(p.theta);
        }
        l3.paramKeys = ['l', 'theta'];

        function l4 (p, pConst) {
            return pConst.mCube * pConst.g * (pConst.lTot - p.l) * Math.cos(p.phi);
        }
        l4.paramKeys = ['l', 'phi'];
        

        return [l0, l1, l2, l3, l4];
    }

    setupMeshs(scene) {
        this.ground = BABYLON.MeshBuilder.CreateGround('ground4', {width:20,height:20}, scene);
        this.ground.receiveShadows = true;

        this.sphere = BF.MakeSphere('sphere5', scene, 2 * this.pConst.rSphere);

        this.cube = BABYLON.MeshBuilder.CreateBox('cube5', {size: this.pConst.sCube}, scene);
        this.cube.receiveShadows = true;

        this.spherePivR = .5
        this.spherePiv = BF.MakeCylinder('spherePiv', scene, .5, 2 * this.spherePivR);
        this.spherePiv.rotation.x = Math.PI/2;
        
        this.cubePivR = .5;
        this.cubePiv = BF.MakeCylinder('cubePiv', scene, .5, 2 * this.cubePivR);
        this.cubePiv.rotation.x = Math.PI/2;

        BF.BakeMeshs([this.spherePiv, this.cubePiv]);

        this.spherePiv.position = BF.Vec3([0, 12, -3]);
        this.cubePiv.position = BF.Vec3([0, 12, 3]);
        
        this.topRope = BF.MakeTube('topRope', scene, .25);
        this.topRope.scaling.x = 6;
        this.topRope.rotation.y = -Math.PI/2;

        this.sphereRope = BF.MakeTube('sphereRope', scene, .25);
        this.sphereRope.rotation.z = -Math.PI/2;

        this.cubeRope = BF.MakeTube('cubeRope', scene, .25);
        this.cubeRope.rotation.z = -Math.PI/2;
        
        BF.BakeMeshs([this.cubeRope, this.sphereRope]);

        // setup parenting
        BF.SetChildren(this.node, [this.ground, this.spherePiv, this.cubePiv, this.topRope]);
        BF.SetChildren(this.spherePiv, [this.sphere, this.topRope, this.sphereRope]);
        BF.SetChildren(this.cubePiv, [this.cube, this.cubeRope]);
    }

    setPos() {
        // sets position of sphere and cube relative to piv on y axis
        // rotates piv the given angle
        this.sphere.position.y = -this.params.l
        this.sphereRope.scaling.y = this.params.l;
        this.spherePiv.rotation.z = this.params.theta;
        
        var cubeSideLength = this.pConst.lTot - this.params.l;
        this.cube.position.y = -cubeSideLength;
        this.cubeRope.scaling.y = cubeSideLength;
        this.cubePiv.rotation.z = this.params.phi;
    }

    step() {
        //this.lagrangian.step(this.dt, this.stepsPerFrame);
        this.lagrangian.stepCorrected(this.dt, this.stepsPerFrame);
        this.imposeBC();
        this.setPos();
    }

    imposeBC() {
        // updates params based on boundary conditions
        if(this.params.l > this.lMax) {
            this.params.l = this.lMax;
            this.params.lDot = -this.collisionVelocityMult * this.params.lDot + this.lagrangian.pDD.l * this.dt;
        } else if(this.params.l < this.lMin) {
            this.params.l = this.lMin;
            this.params.lDot = -this.collisionVelocityMult * this.params.lDot + this.lagrangian.pDD.l * this.dt;
        }
    }

    setupGUIMenu(gui, anim) {
        this.guiMenu = UI.MakeSubMenu('sim settings', gui.mainMenu, gui);

        /* var gSliderPanel = UI.MakeSliderPanel('gravity', '', 0, 40, anim.pConst.g, function(value) {
            anim.pConst.g = value;
        }); */

        var mSphereSliderPanel = UI.MakeSliderPanel('sphere mass', '', .1, 5, anim.pConst.mSphere, function(value) {
            anim.pConst.mSphere = value;
        })

        var mCubeSliderPanel = UI.MakeSliderPanel('cube mass', '', .1, 5, anim.pConst.mCube, function(value) {
            anim.pConst.mCube = value;
        })

        var kickSpherePanel = UI.MakeTwoButtonPanel('kickSphere+', 'kick sphere +', function() {
            anim.params.thetaDot += 2;
        }, 'kickSphere-', 'kick sphere -', function() {
            anim.params.thetaDot -= 2;
        })

        var kickCubePanel = UI.MakeTwoButtonPanel('kickCube+', 'kick cube +', function() {
            anim.params.phiDot += 2;
        }, 'kickCube-', 'kick cube -', function() {
            anim.params.phiDot -= 2;
        })

        this.guiMenu.addControls([mSphereSliderPanel, mCubeSliderPanel, kickSpherePanel, kickCubePanel, UI.MakeVertSpacer(UI.SPACING)]);
    }

    activate() {
        this.node.setEnabled(true);
        this.guiMenu.parentButton.isVisible = true;
    }

    deactivate() {
        this.node.setEnabled(false);
        this.guiMenu.parentButton.isVisible = false;
    }
}

class Anim8 {
    // spinning ring
    constructor(scene, myMats, shadows, gui) {
        // make node
        this.node = BF.MakeTransformNode('anim8node', scene);

        // setup lagrangian update system
        this.setupLagrangian();

        this.setupMeshs(scene);

        this.setMaterials(myMats);

        BF.ConnectMeshsToShadows([this.ring, this.mass, this.ground], shadows);

        this.step = this.stepForced;
        this.setPos(this.forcedParams);

        this.setupGUIMenu(gui, this);
    }

    setupLagrangian() {
        this.dt = .01;
        this.stepsPerFrame = 2;

        // forced lagrangian params. for when phiDot is set manually (a function of time in physics sense)
        this.forcedParams = {theta: 1, thetaDot: 2};
        this.freeParams = {theta: 1, thetaDot: 2, phi: 0, phiDot: 0}; // free Lagrangian params. phiDot included as a param
        this.pConst = {mSphere: 1, rSphere: 1, mRing: 1, rRing: 6, g: 10, phi: 0, phiDot: 2.5};
        this.setConstants(this.pConst);
        this.damping = {thetaDot: 0.01, phiDot: 0.01}; // can use one damping obj for both

        this.forcedLagrangian = new SplitLagrangian(this.makeForcedLFuncs(), this.forcedParams, this.pConst, this.damping);
        this.freeLagrangian = new SplitLagrangian(this.makeFreeLFuncs(), this.freeParams, this.pConst, this.damping);
    }

    setConstants(pConst) {
        pConst.c0 = .5 * pConst.mSphere * (MF.Square(pConst.rRing) + (2/5) * MF.Square(pConst.rSphere));
        pConst.c1 = .5 * pConst.mSphere * MF.Square(pConst.rRing);
        pConst.c2 = .5 * (pConst.mSphere * (2/5) * MF.Square(pConst.rSphere) + .5 * pConst.mRing * MF.Square(pConst.rRing));
        pConst.c3 = pConst.mSphere * pConst.g * pConst.rRing;
    }

    makeForcedLFuncs() {
        function l0(p, pConst) {
            return pConst.c0 * MF.Square(p.thetaDot);
        }
        l0.paramKeys = ['thetaDot'];

        function l1(p, pConst) {
            return pConst.c1 * MF.Square(Math.sin(p.theta) * pConst.phiDot);
        }
        l1.paramKeys = ['theta'];

        function l2(p, pConst) {
            return pConst.c3 * Math.cos(p.theta);
        }
        l2.paramKeys = ['theta'];

        return [l0, l1, l2];
    }

    makeFreeLFuncs() {
        function l0(p, pConst) {
            return pConst.c0 * MF.Square(p.thetaDot);
        }
        l0.paramKeys = ['thetaDot'];

        function l1(p, pConst) {
            return (pConst.c1 * MF.Square(Math.sin(p.theta)) + pConst.c2) * MF.Square(p.phiDot);
        }
        l1.paramKeys = ['theta', 'phiDot'];

        function l2(p, pConst) {
            return pConst.c3 * Math.cos(p.theta);
        }
        l2.paramKeys = ['theta'];

        return [l0, l1, l2];
    }

    switchToFreeMode(phiDotSP, phiDampSP) {
        this.freeParams.theta = this.forcedParams.theta;
        this.freeParams.thetaDot = this.forcedParams.thetaDot;
        this.freeParams.phi = this.pConst.phi;
        this.freeParams.phiDot = this.pConst.phiDot;
        this.step = this.stepFree;
        phiDotSP.isVisible = false;
        phiDampSP.isVisible = true;
    }

    switchToForcedMode(phiDotSP, phiDampSP) {
        this.forcedParams.theta = this.freeParams.theta;
        this.forcedParams.thetaDot = this.freeParams.thetaDot;
        this.pConst.phi = this.freeParams.phi;
        this.pConst.phiDot = this.freeParams.phiDot;
        this.step = this.stepForced;
        phiDotSP.children[1].value = this.pConst.phiDot;
        phiDotSP.isVisible = true;
        phiDampSP.isVisible = false;
    }

    setupMeshs(scene) {
        this.ground = BABYLON.MeshBuilder.CreateGround('ground4', {width:20,height:20}, scene);
        this.ground.receiveShadows = true;

        this.ring = BABYLON.MeshBuilder.CreateTorus('ring', {diameter: 2*this.pConst.rRing, thickness: .25, tessellation: 64}, scene);
        this.ring.rotation.x = Math.PI/2;
        this.ring.bakeCurrentTransformIntoVertices();
        this.ring.position = BF.Vec3([0,this.pConst.rRing + 2,0]);
        this.ring.receiveShadows = true;

        this.massParent = BF.MakeTransformNode('massParent', scene);
        this.mass = BABYLON.MeshBuilder.CreateSphere('ringMass', {segments:16, diameter: 2*this.pConst.rSphere}, scene);
        this.massParent.parent = this.ring;
        this.mass.parent = this.massParent;
        BF.SetVec3([0,-this.pConst.rRing, 0], this.mass.position);
        this.mass.receiveShadows = true;

        BF.SetChildren(this.node, [this.ground, this.ring]);
    }

    setMaterials(myMats) {
        this.ground.material = myMats.wArrow;
        this.ring.material = myMats.wArrow;
        this.mass.material = myMats.darkMoon;
        BF.ForceCompileMaterials([this.ring, this.mass, this.ground]);
    }

    setPos(p) {
        // updates position of mesh based on current params
        this.massParent.rotation.z = p.theta;
        this.ring.rotation.y = this.pConst.phi;
    }

    stepForced() {
        this.forcedLagrangian.stepCorrected(this.dt, this.stepsPerFrame);
        this.pConst.phi += this.stepsPerFrame * this.pConst.phiDot * this.dt;
        this.setPos(this.forcedParams);
    }

    stepFree() {
        this.freeLagrangian.stepCorrected(this.dt, this.stepsPerFrame);
        this.pConst.phi = this.freeParams.phi;
        this.setPos(this.freeParams);
    }

    setupGUIMenu(gui, anim) {
        this.guiMenu = UI.MakeSubMenu('sim settings', gui.mainMenu, gui);

        /* var gSliderPanel = UI.MakeSliderPanel('gravity', '', 0, 40, anim.pConst.g, function(value) {
            anim.pConst.g = value;
            anim.pConst.c3 = anim.pConst.mSphere * anim.pConst.g * anim.pConst.rRing;
        }); */

        var phiDotSliderPanel = UI.MakeSliderPanel('ring spin speed', '', 0, 6, anim.pConst.phiDot, function(value) {
            anim.pConst.phiDot = value;
        })

        var thetaDampingSliderPanel = UI.MakeSliderPanelPrecise('theta damping', '', 0, .2, anim.damping.thetaDot, function(value) {
            anim.damping.thetaDot = value;
        });

        var phiDampingSliderPanel = UI.MakeSliderPanelPrecise('phi damping', '', 0, .2, anim.damping.phiDot, function(value) {
            anim.damping.phiDot = value;
        });
        phiDampingSliderPanel.isVisible = false;

        var modeSwitchButton = UI.MakeDualButton('modeSwitch', 'switch to free ring', 'switch to forced ring', function() {
            anim.switchToForcedMode(phiDotSliderPanel, phiDampingSliderPanel);
        }, function() {
            anim.switchToFreeMode(phiDotSliderPanel, phiDampingSliderPanel);
        })
        UI.SetControlsWidthHeight([modeSwitchButton], '200px', '50px');
        modeSwitchButton.color = 'white'

        this.guiMenu.addControls([phiDotSliderPanel, modeSwitchButton, thetaDampingSliderPanel, phiDampingSliderPanel, UI.MakeVertSpacer()]);
    }

    activate() {
        this.node.setEnabled(true);
        this.guiMenu.parentButton.isVisible = true;
    }

    deactivate() {
        this.node.setEnabled(false);
        this.guiMenu.parentButton.isVisible = false;
    }
}
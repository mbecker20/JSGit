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
        this.lagrangian = new Lagrangian(lFunc, this.params, this.pConst, this.damping);

        // setup meshes
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

        // set materials
        this.ground.material = myMats.wArrow;
        this.sphere.material = myMats.darkMoon;
        this.cube.material = myMats.darkMoon;
        this.spherePiv.material = myMats.darkMoon;
        this.cubePiv.material = myMats.darkMoon;
        this.topRope.material = myMats.wArrow;
        this.sphereRope.material = myMats.wArrow;
        this.cubeRope.material = myMats.wArrow;

        // connect meshs to shadows and force pre-compile materials
        BF.ConnectMeshsToShadows([this.ground, this.sphere, this.cube, this.spherePiv, this.cubePiv, this.topRope, this.sphereRope, this.cubeRope], shadows);
        BF.ForceCompileMaterials([this.topRope, this.ground, this.sphere, this.cube, this.spherePiv, this.cubePiv]);

        // set BC
        this.lMin = this.spherePivR + this.sphereR;
        this.lMax = this.lTot - this.cubePivR - this.cubeR;

        // set initial position of everything
        this.setPos();
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
}
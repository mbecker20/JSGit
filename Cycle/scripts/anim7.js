class Anim7 {
    constructor(scene, myMats, shadows) {
        // sphere swings, cube up and down
        this.node = BF.MakeTransformNode('anim4Node', scene);

        // setup lagrangian update system
        this.dt = .01;
        this.stepsPerFrame = 2;
        this.params = {l: 6, lDot: 3, theta: 1, thetaDot: 2, phi: 0, phiDot: 10};
        this.pConst = {mSphere: 1, mCube: 1.1, g: 10, lTot: 10, rSphere: 1, sCube: 2};
        this.damping = {lDot: .001, thetaDot: .001, phiDot: .001};
        this.pConst.sphereIcm = this.pConst.mSphere * (2/5) * MF.Square(this.pConst.rSphere);
        this.pConst.cubeIcm = this.pConst.mCube * (1/6) * MF.Square(this.pConst.sCube);

        this.lagrangian = new Lagrangian(this.lFunc, this.params, this.pConst, this.damping);
        this.collisionVelocityMult = .6; // multiplied by -velocity on collision with pivot;

        // setup meshes
        this.setupMeshs(scene);
        
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
        this.lMin = this.spherePivR + this.pConst.rSphere;
        this.lMax = this.pConst.lTot - this.cubePivR - this.pConst.sCube/2;

        // set initial position of everything
        this.setPos();
    }

    lFunc(p, pConst) {
        var sphereI = pConst.sphereIcm + pConst.mSphere * MF.Square(p.l);
        var cubeI = pConst.cubeIcm + pConst.mCube * MF.Square(pConst.lTot - p.l);
        var t1 = .5 * (pConst.mSphere + pConst.mCube) * MF.Square(p.lDot);
        var t2 = .5 * (sphereI * MF.Square(p.thetaDot) + cubeI * MF.Square(p.phiDot));
        var t3 = pConst.mSphere * pConst.g * p.l * Math.cos(p.theta);
        var t4 = pConst.mCube * pConst.g * (pConst.lTot - p.l) * Math.cos(p.phi);
        return t1 + t2 + t3 + t4;
    }

    setupMeshs(scene) {
        this.ground = BABYLON.MeshBuilder.CreateGround('ground4', {width:10,height:10}, scene);
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

        this.spherePiv.position = BF.Vec3([0, 12, -2]);
        this.cubePiv.position = BF.Vec3([0, 12, 2]);
        
        this.topRope = BF.MakeTube('topRope', scene, .25);
        this.topRope.scaling.x = 4;
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
        this.lagrangian.step(this.dt, this.stepsPerFrame);
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
}
class Anim5 {
    constructor(scene, myMats, shadows) {
        // sphere swings, cube up and down
        this.node = new BABYLON.TransformNode('anim4Node', scene);

        this.ground = BABYLON.MeshBuilder.CreateGround('ground4', {width:10,height:10}, scene);
        this.ground.position = BF.ZeroVec3();
        this.ground.material = myMats.blue;
        this.ground.receiveShadows = true;

        this.sphere = BABYLON.MeshBuilder.CreateSphere('sphere5', {segments:16, diameter:2}, scene);
        this.sphere.material = myMats.chill;
        this.sphere.receiveShadows = true;

        this.cube = BABYLON.MeshBuilder.CreateBox('cube5', {size:2}, scene);
        this.cube.material = myMats.chill;
        this.cube.receiveShadows = true;

        this.spherePiv = BABYLON.MeshBuilder.CreateCylinder('piv1', {height: 1, diameter: 1, tessellation: 24}, scene);
        this.spherePiv.position = BF.Vec3([0, 12, -3]);

        this.cubePiv = BABYLON.MeshBuilder.CreateCylinder('piv1', {height: 1, diameter: 1, tessellation: 24}, scene);
        this.cubePiv.position = BF.Vec3([0, 12, 3]);

        BF.SetChildren(this.node, [this.ground, this.spherePiv, this.cubePiv]);
        BF.SetChildren(this.spherePiv, [this.sphere]);
        BF.SetChildren(this.cubePiv, [this.cube]);
        BF.ConnectMeshsToShadows([this.ground, this.sphere], shadows);
        BF.ForceCompileMaterials([this.ground, this.sphere]);

        function lFunc(p, pConst) {
            var t1 = (1/2)*(pConst.mSphere + pConst.mCube)*MF.Square(p.lDot);
            var t2 = (1/2)*pConst.mSphere*MF.Square(p.l*p.thetaDot);
            var t3 = pConst.g*p.l*(pConst.mSphere*Math.cos(p.theta) - pConst.mCube);
            return t1 + t2 + t3;
        }

        this.dt = .01;
        this.params = {l: 4, lDot: 0, theta: 1, thetaDot:0};
        this.pConst = {mSphere: 1, mCube: 1.5, g: 10, lTot:10};
        this.lagrangian = new Lagrangian(lFunc, this.params, this.pConst);
        this.setPos();
    }

    setPos() {
        this.cube.position.y = -(this.pConst.lTot - this.params.l);
        this.sphere.position = BF.Vec3([Math.sin(this.params.theta), -Math.cos(this.params.theta), 0]).scale(this.params.l);
    }

    step() {
        this.lagrangian.step(this.dt);
        this.setPos();
    }
}
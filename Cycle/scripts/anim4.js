class Anim4 {
    constructor(scene, myMats, shadows) {
        this.node = new BABYLON.TransformNode('anim4Node', scene);

        this.ground = BABYLON.MeshBuilder.CreateGround('ground4', {width:10,height:10}, scene);
        this.ground.position = BF.ZeroVec3();
        this.ground.material = myMats.wArrow;
        this.ground.receiveShadows = true;

        var showWArrow = true;
        var showAxes = false;

        this.tHandle = BF.MakeTHandle('tHandle', scene, 3, 1, 4, 1);
        this.tHandle.material = myMats.darkMoon;
        this.tHandle.receiveShadows = true;

        BF.ConnectMeshsToShadows([this.tHandle, this.ground], shadows);

        this.dt = .008;
        this.g = 0;

        this.tHandle = makePhysBody(scene, this.tHandle, BF.ZeroVec3(), [10,10,700], .1, this.dt, showWArrow, showAxes);
        this.tHandle.p = BF.Vec3([0, 5, 0]);
        this.tHandle.position = BF.Vec3([0, 5, 0]);
        this.tHandle.wArrow.pointer.material = myMats.wArrow;
        this.tHandle.updateMesh();

        BF.SetChildren(this.node, [this.ground, this.tHandle, this.tHandle.wArrow]);
        
        this.stepsPerFrame = 1;

        BF.ForceCompileMaterials([this.tHandle, this.tHandle.wArrow.pointer, this.ground]);
    }

    step(g, dt) {
        for(var i=0; i<this.stepsPerFrame; i++) {
            this.tHandle.step(this.g, this.dt);
        }
        this.tHandle.updateMesh();
    }
}
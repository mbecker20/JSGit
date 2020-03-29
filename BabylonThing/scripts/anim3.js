class Anim3 {
    constructor(scene, myMats, shadows) {
        this.node = new BABYLON.TransformNode('anim3Node', scene);

        this.ground = BABYLON.MeshBuilder.CreateGround('ground4', {width:10,height:10}, scene);
        this.ground.position = BF.Vec3([0, 0, 0]);
        this.ground.material = myMats.blue;
        this.ground.receiveShadows = true;

        this.ringRad = 4;
        this.ring = BABYLON.MeshBuilder.CreateTorus('ring', {diameter:2*this.ringRad,thickness:.25, tessellation:64}, scene);
        this.ring.rotation.x = Math.PI/2;
        this.ring.bakeCurrentTransformIntoVertices();
        this.ring.position = BF.Vec3([0,5,0]);
        this.ring.material = myMats.wArrow;
        this.ring.receiveShadows = true;

        this.mass = BABYLON.MeshBuilder.CreateSphere('ringMass', {segments:16, diameter:1.5}, scene);
        this.mass.parent = this.ring;
        this.mass.position = BF.Vec3([0,-this.ringRad,0]);
        this.mass.material = myMats.chill;
        this.mass.receiveShadows = true;

        BF.SetChildren(this.node, [this.ground, this.ring]);
        BF.ConnectMeshsToShadows([this.ring, this.mass, this.ground], shadows);

        this.theta = 0.2; // mass position on ring
        this.thetaDot = 4;
        this.omega = 2; //ring rotation speed
        this.damping = 0.05;

        this.phi = 0;

        this.stepsPerFrame = 1;

        this.dt = .03;

        BF.ForceCompileMaterials([this.ring, this.mass, this.ground]);
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
        this.mass.position = BF.Vec3(math.multiply([Math.sin(this.theta),-Math.cos(this.theta),0],this.ringRad));
        this.ring.rotation.y = this.phi;
    }


}
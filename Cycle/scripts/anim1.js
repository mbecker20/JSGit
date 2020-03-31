class Anim1 {
    constructor(scene, myMats, shadows) {
        this.node = new BABYLON.TransformNode('anim1Node', scene);

        this.r=2;
        this.sphere = BABYLON.MeshBuilder.CreateSphere('sphere1', {segments:16, diameter:2}, scene);
        this.sphere.position = BF.Vec3([0, 2, 0]);
        this.sphere.material = myMats.darkMoon;
        this.sphere.receiveShadows = true;

        this.ground = BABYLON.MeshBuilder.CreateGround('ground1', {width:10,height:10}, scene);
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

        this.deltaRot=.08

        this.groundVUp=Math.sqrt(this.v*this.v-2*this.g*(this.sphere.position.y-1));

        this.onGround=false;
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
}
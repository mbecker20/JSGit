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
        this.damping = {thetaDot: .01, phiDot: .01};
        this.lagrangian = new Lagrangian(lFunc, this.params, this.pConst, this.damping, .01);

        this.dt = .002;
        this.stepsPerFrame = 10;

        // initialize meshes
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

        // set materials
        this.sphere.material = myMats.darkMoon;
        this.m1.material = myMats.darkMoon;
        this.m2.material = myMats.darkMoon;
        this.l1.material = myMats.wArrow;
        this.l2.material = myMats.wArrow;

        // use sphere as origin for rest of objects, force compile materials, connect meshs to shadows
        BF.SetChildren(this.node, [this.sphere]);
        BF.SetChildren(this.sphere, [this.m1, this.m2, this.l1, this.l2]);
        BF.ForceCompileMaterials([this.sphere, this.m1, this.m2, this.l1, this.l2]);
        BF.ConnectMeshsToShadows([this.sphere, this.m1, this.m2, this.l1, this.l2], shadows);

        this.setPos();
    }

    step() {
        this.lagrangian.step(this.dt, this.stepsPerFrame);
        this.setPos();
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
}
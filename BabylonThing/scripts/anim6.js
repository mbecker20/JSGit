class Anim6 {
    //double pendulum 
    constructor(scene, myMats, shadows) {
        this.node = BF.MakeTransformNode('node6', scene);

        this.sphere = BF.MakeSphere('sphere6', {}, scene); // the anchor of the double pend
        this.sphere.position.y = 15;
        this.sphere.material = myMats.bwPattern;
        this.sphere.parent = this.node;

        this.m1 = BF.MakeCylinder('cylinder61', {height: .5, diameter: 2, tessellation: 24}, scene);
        this.m1.material = myMats.bwPattern;
        this.m1.rotation.x = Math.PI/2;
        this.m1.bakeCurrentTransformIntoVertices();
        this.m1.parent = this.sphere;

        this.m2 = BF.MakeCylinder('cylinder61', {height: .5, diameter: 2, tessellation: 24}, scene);
        this.m2.material = myMats.bwPattern;
        this.m2.rotation.x = Math.PI/2;
        this.m2.bakeCurrentTransformIntoVertices();
        this.m2.parent = this.sphere;

        function lFunc(p, pConst) {
            var t1 = (1/2)*(pConst.m1 + pConst.m2)*MF.Square(pConst.l1*p.thetaDot);
            var t2 = (1/2)*pConst.m2*(MF.Square(pConst.l2*p.phiDot) + 2*pConst.l1*pConst.l2*Math.cos(p.theta-p.phi));
            var t3 = (pConst.m1 + pConst.m2)*pConst.g*pConst.l1*Math.cos(p.theta);
            var t4 = pConst.m2*pConst.g*pConst.l2*Math.cos(p.phi);
            return t1 + t2 + t3 + t4;
        }

        this.params = {theta: 0, thetaDot: 0, phi: .1, phiDot: .1};
        this.pConst = {m1: 1, m2: 1, l1: 5, l2: 5, g:10};
        this.lagrangian = new Lagrangian(lFunc, this.params, this.pConst);

        this.m1.position = BF.Vec3([Math.sin(this.params.theta), -Math.cos(this.params.theta), 0]).scale(this.pConst.l1);
        this.m2.position = BF.AddScaleArToVec3([Math.sin(this.params.theta), -Math.cos(this.params.theta), 0], this.pConst.l1, [Math.sin(this.params.phi), Math.cos(this.params.phi), 0], this.pConst.l2);
        
        this.l1 = BF.MakeTube('l1', scene, BF.Vec3ToAr(this.m1.position), .25);
        this.l1.material = myMats.wArrow;
        this.l1.parent = this.sphere;

        this.l2 = BF.MakeTube('l2', scene, math.multiply([Math.sin(this.params.phi), -Math.cos(this.params.phi), 0], this.pConst.l2), .25);
        this.l2.material = myMats.wArrow;
        this.l2.parent = this.sphere;
        this.l2.position = this.m1.position;

        this.dt = .01;
    }

    step() {
        this.lagrangian.step(this.dt);
        this.setPos();
    }

    setPos() {
        var m1Pos = math.multiply([Math.sin(this.params.theta), -Math.cos(this.params.theta), 0], this.pConst.l1);
        var m2RelPos = math.multiply([Math.sin(this.params.phi), -Math.cos(this.params.phi), 0], this.pConst.l2);
        var m2Pos = math.add(m1Pos, m2RelPos);
        this.m1.position = BF.Vec3(m1Pos);
        this.m1.rotation.z = -this.params.theta;
        this.l1.setDirLength(m1Pos);

        this.m2.position = BF.Vec3(m2Pos);
        this.m2.rotation.z = -this.params.phi;
        this.l2.position = this.m1.position;
        this.l2.setDirLength(m2RelPos);
    }
}
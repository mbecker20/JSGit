function makePhysBody(scene,mesh,v,angMom,density,dt,showWArrow,showAxes) {
    // returns the mesh with added functions and properties
    // mesh will have COM at origin after creation
    PF.MoveToCOM(mesh);
    mesh.angMom = angMom; //ar 3
    mesh.p = BF.ZeroVec3();
    mesh.v = v; //babylon vec3
    mesh.momTens = PF.GetMomentTensor(mesh,density);
    mesh.oTens = BF.GetOTens(mesh);
    mesh.w = PF.getCorrW(mesh.oTens,mesh.momTens,mesh.angMom,dt);
    mesh.wVec3 = BF.Vec3([mesh.w])

    mesh.arrowScale = .25;
    mesh.wArrow = BF.MakeArrow(mesh.name.concat(' wArrow'), scene, math.multiply(mesh.w, mesh.arrowScale), .3, .7);
    mesh.wArrow.position = mesh.position;
    mesh.showWArrow = showWArrow;

    mesh.axes = BF.MakeAxes(mesh.name.concat(' axes'), scene, 4);
    mesh.axes.setParent(mesh);
    mesh.showAxes = showAxes;

    mesh.step = function(g, dt) {
        mesh.oTens = BF.GetOTens(mesh);
        mesh.p.add(mesh.v.scale(dt));
        mesh.v.y += g*dt;
        mesh.w = PF.getCorrW(mesh.oTens, mesh.momTens, mesh.angMom, dt);
        mesh.rotate(BF.SetVec3(mesh.w, mesh.wVec3), VF.Mag(mesh.w)*dt, BABYLON.Space.WORLD);
        mesh.wArrow.addRot(VF.Mag(mesh.w) * dt);
    }

    mesh.updateMeshArrow = function() {
        mesh.position = mesh.p;
        mesh.wArrow.setDirLength(math.multiply(mesh.w, mesh.arrowScale));
        mesh.wArrow.position = mesh.position;
    }
    
    mesh.updateMeshNoArrow = function() {
        mesh.position = mesh.p;
    }

    mesh.setState = function() {
        if(mesh.showWArrow) {
            mesh.updateMesh = mesh.updateMeshArrow;
            if(mesh.showAxes) {
                mesh.wArrow.setEnabled(true);
                mesh.axes.setEnabled(true);
            } else {
                mesh.wArrow.setEnabled(true);
                mesh.axes.setEnabled(false);
            }
        } else {
            mesh.updateMesh = mesh.updateMeshNoArrow;
            if(mesh.showAxes) {
                mesh.wArrow.setEnabled(false);
                mesh.axes.setEnabled(true);
            } else {
                mesh.wArrow.setEnabled(false);
                mesh.axes.setEnabled(false);
            }
        }
    }

    mesh.setState();

    return mesh;
}
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
        mesh.rotate(BF.Vec3(mesh.w), VF.Mag(mesh.w)*dt, BABYLON.Space.WORLD);
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

function makePhysBodyAlt(scene,mesh,v,angMom,density,dt,showWArrow,showAxes) {
    // returns the mesh with added functions and properties
    // mesh will have COM at origin after creation
    // uses freezeWorldMatrix, manually creating world matrix
    // makes meshes buggy
    PF.MoveToCOM(mesh);
    mesh.angMom = angMom; //ar 3
    mesh.v = v; //babylon vec3
    mesh.p = BF.ZeroVec3();
    mesh.momTens=PF.GetMomentTensor(mesh,density);
    mesh.oTens=[[1,0,0],[0,1,0],[0,0,1]];
    mesh.worldMat=BABYLON.Matrix.Identity();
    mesh.worldMatRows = BF.MakeWorldMatRows();
    mesh.w = PF.getCorrW(mesh.oTens,mesh.momTens,mesh.angMom,dt);

    mesh.arrowScale = .25;
    mesh.wArrow = BF.MakeArrow(mesh.name.concat(' wArrow'), scene, math.multiply(mesh.w, mesh.arrowScale), .3, .7);
    mesh.wArrow.position = mesh.position;
    mesh.showWArrow = showWArrow;

    mesh.axes = BF.MakeAxes2(mesh.name.concat(' axes'), scene, 4);
    mesh.showAxes = showAxes;

    mesh.step = function(g,dt) {
        mesh.p.add(mesh.v.scale(dt));
        mesh.v.y+=g*dt;
        mesh.w=PF.getCorrW(mesh.oTens, mesh.momTens, mesh.angMom, dt);
        mesh.oTens=Rot.oTens2(mesh.oTens, mesh.w, dt);
    }

    mesh.updateMeshArrowAxes = function() {
        BF.setWorldMat(mesh.oTens, mesh.p, mesh.worldMat, mesh.worldMatRows);
        mesh.freezeWorldMatrix(mesh.worldMat);
        mesh.axes.setWorldMat(mesh.worldMat);
        mesh.wArrow.setDirLength(math.multiply(mesh.w, mesh.arrowScale));
        mesh.wArrow.position = mesh.p;
    }
    
    mesh.updateMeshNoArrowAxes = function() {
        BF.setWorldMat(mesh.oTens, mesh.p, mesh.worldMat, mesh.worldMatRows);
        mesh.freezeWorldMatrix(mesh.worldMat);
        mesh.axes.setWorldMat(mesh.worldMat);
    }

    mesh.updateMeshArrowNoAxes = function() {
        BF.setWorldMat(mesh.oTens, mesh.p, mesh.worldMat, mesh.worldMatRows);
        mesh.freezeWorldMatrix(mesh.worldMat);
        mesh.wArrow.setDirAndLength(math.multiply(mesh.w, mesh.arrowScale));
        mesh.wArrow.position = mesh.p;
    }

    mesh.updateMeshNoArrowNoAxes = function() {
        BF.setWorldMat(mesh.oTens, mesh.p, mesh.worldMat, mesh.worldMatRows);
        mesh.freezeWorldMatrix(mesh.worldMat);
    }

    mesh.setState = function() {
        if(mesh.showWArrow) {
            if(mesh.showAxes) {
                mesh.updateMesh = mesh.updateMeshArrowAxes;
                mesh.wArrow.setEnabled(true);
                mesh.axes.setEnabled(true);
            } else {
                mesh.updateMesh = mesh.updateMeshArrowNoAxes;
                mesh.wArrow.setEnabled(true);
                mesh.axes.setEnabled(false);
            }
        } else {
            if(mesh.showAxes) {
                mesh.updateMesh = mesh.updateMeshNoArrowAxes;
                mesh.wArrow.setEnabled(false);
                mesh.axes.setEnabled(true);
            } else {
                mesh.updateMesh = mesh.updateMeshNoArrowNoAxes;
                mesh.wArrow.setEnabled(false);
                mesh.axes.setEnabled(false);
            }
        }
    }

    mesh.setState();

    return mesh;
}
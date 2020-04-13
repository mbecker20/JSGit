import { VF } from './funcClasses.js';

export class BF {
    // mesh constructors
    static MakeBox(name, scene, width, height, depth, otherParams = {}, receiveShadows = true) {
        // params: length, width, height,...
        // lwh is ar3 ([length, width, height])
        otherParams.width = width; //x
        otherParams.height = height; //y
        otherParams.depth = depth; //z
        var box = BABYLON.MeshBuilder.CreateBox(name, otherParams, scene);
        box.receiveShadows = receiveShadows;
        return box;
    }

    static MakeSphere(name, scene, diameter, segments = 16, otherParams = {}, receiveShadows = true) {
        // params: diameter, segments
        otherParams.diameter = diameter;
        otherParams.segments = segments;
        var sphere = BABYLON.MeshBuilder.CreateSphere(name, otherParams, scene);
        sphere.receiveShadows = receiveShadows;
        return sphere;
    }

    static MakeTransformNode(name, scene) {
        return new BABYLON.TransformNode(name, scene);
    }

    static MakeCylinder(name, scene, height, diameter, tessellation = 24, otherParams = {}, receiveShadows = true) {
        // params: height, diameter, tessellation
        otherParams.height = height;
        otherParams.diameter = diameter;
        otherParams.tessellation = tessellation;
        var cyl = BABYLON.MeshBuilder.CreateCylinder(name, otherParams, scene);
        cyl.receiveShadows = receiveShadows;
        return cyl;
    }

    static MakeArrow(name, scene, direction, diameter, arrowDiameter) {
        //name is string
        //vertices pointing [1,0,0];
        //tail at origin;
        //direction is ar3
        var tube = BABYLON.MeshBuilder.CreateCylinder(name.concat(' tube'), {height: .85, diameter: diameter, tessellation: 24}, scene);
        var tip = BABYLON.MeshBuilder.CreateCylinder(name.concat(' tip'), {height: .15, diameterTop: 0, diameterBottom: arrowDiameter, tessellation: 24}, scene);
        tube.locallyTranslate(BF.Vec3([0,.425,0]));
        tube.bakeCurrentTransformIntoVertices();
        tip.locallyTranslate(BF.Vec3([0,.925,0]));
        tip.bakeCurrentTransformIntoVertices();
        
        var arrow = BF.MakeTransformNode(name, scene); // this is the top level rotator (last to be rotated);
        arrow.secondRot = BF.MakeTransformNode(name.concat(' secondRot'), scene); // second to be rotated
        arrow.secondRot.parent = arrow;

        arrow.pointer = BABYLON.Mesh.MergeMeshes([tube,tip]); // first to be rotated (about x axis);
        arrow.pointer.rotation.z = -Math.PI/2; // aligns with x axis;
        arrow.pointer.bakeCurrentTransformIntoVertices();
        arrow.pointer.parent = arrow.secondRot;

        arrow.setDirLength = function(ar3) {
            const length = VF.Mag(ar3);
            const unit = VF.Unit2(ar3, length);
            if(Math.abs(unit[1]) < .7) { // xz ground altitude and azimuth if unit not close to +/- y axis
                const altAzim = VF.GetAltAzimXZ(unit);
                arrow.pointer.scaling.x = length;
                arrow.secondRot.rotation.z = altAzim[0];
                arrow.secondRot.rotation.y = 0;
                arrow.rotation.y = altAzim[1];
                arrow.rotation.z = 0;
            } else { // xy ground altitude and azimuth
                const altAzim = VF.GetAltAzimXY(unit);
                arrow.pointer.scaling.x = length;
                arrow.secondRot.rotation.y = altAzim[0];
                arrow.secondRot.rotation.z = 0;
                arrow.rotation.z = altAzim[1];
                arrow.rotation.y = 0;
            }
            
        }

        arrow.addRot = function(deltaRot) {
            // first rotates arrow around its pointer x axis
            arrow.pointer.rotation.x += deltaRot;
        }

        arrow.setDirLength(direction);

        return arrow;
    }

    static MakeAxes(name, scene, length, mats = window.axesMats) {
        // mats is ar4[materials] for x y and z axes, and center sphere
        // parent axes 
        var diameter = .4;
        var arrowDiameter = .6;
        var sphereDiameter = .8;

        var axes = new BABYLON.TransformNode('axes', scene);

        var xAxis = BF.MakeArrow(name.concat(' xAxis'), scene, [length,0,0], diameter, arrowDiameter);
        xAxis.pointer.material = mats[0];
        xAxis.parent = axes;

        var yAxis = BF.MakeArrow(name.concat(' yAxis'), scene, [0,length,0], diameter, arrowDiameter);
        yAxis.pointer.material = mats[1];
        yAxis.parent = axes;

        var zAxis = BF.MakeArrow(name.concat(' zAxis'), scene, [0,0,length], diameter, arrowDiameter);
        zAxis.pointer.material = mats[2];
        zAxis.parent = axes;

        var center = BABYLON.MeshBuilder.CreateSphere(name.concat(' sphere'), {segments:16, diameter:sphereDiameter}, scene);
        center.material = mats[3];
        center.parent = axes;

        BF.ForceCompileMaterials([xAxis.pointer, yAxis.pointer, zAxis.pointer, center]);

        return axes;
    }

    static MakeTHandle(name, scene, mainLength, mainDiameter, crossLength, crossDiameter) {
        // main oriented along x axis
        // cross oriented along y axis shifted to positive z
        var main = BABYLON.MeshBuilder.CreateCylinder(name.concat(' main'), {height: mainLength, diameter: mainDiameter, tessellation: 24}, scene);
        var cross = BABYLON.MeshBuilder.CreateCylinder(name.concat(' cross'), {height: crossLength, diameter: crossDiameter, tessellation: 24}, scene);

        main.rotation.x = Math.PI/2;
        main.bakeCurrentTransformIntoVertices();

        cross.locallyTranslate(BF.Vec3([0,0,mainLength/2]));
        cross.bakeCurrentTransformIntoVertices();

        var tHandle = BABYLON.Mesh.MergeMeshes([main,cross]);

        return tHandle;
    }

    static MakeTube(name, scene, diameter, receiveShadows = true) {
        //name is string
        //pointing [1,0,0];
        //tail at origin;
        //direction is ar3
        var tube = BABYLON.MeshBuilder.CreateCylinder(name, {height: 1, diameter: diameter, tessellation: 24}, scene);
        tube.locallyTranslate(BF.Vec3([0,.5,0]));
        tube.bakeCurrentTransformIntoVertices();
        tube.rotation.z = -Math.PI/2;
        tube.bakeCurrentTransformIntoVertices();
        tube.receiveShadows = receiveShadows;

        return tube;
    }

    // other helpers
    static GetOTens(mesh) {
        mesh.computeWorldMatrix(false);
        const ar = mesh.getWorldMatrix()._m;
        return [[ar[0],ar[1],ar[2]],[ar[4],ar[5],ar[6]],[ar[8],ar[9],ar[10]]];
    }

    static GetRotMat2(matrix) {
        const ar=matrix._m;
        return [[ar[0],ar[1],ar[2]],[ar[4],ar[5],ar[6]],[ar[8],ar[9],ar[10]]];
    }

    static MakeWorldMat(oTens,position) {
        //oTens is ar3x3, position is babylon vec3
        let mat = BABYLON.Matrix.Identity();
        mat.setRow(0,BF.Vec4_2(oTens[0],0));
        mat.setRow(1,BF.Vec4_2(oTens[1],0));
        mat.setRow(2,BF.Vec4_2(oTens[2],0));
        mat.setRow(3,BF.Vec4_2([position.x,position.y,position.z],1))
        return mat;
    }

    static SetWorldMat(oTens,position,target,rows) {
        //oTens is ar3x3, position is babylon vec3
        //target is the initialized matrix to become worldMat
        //rows is initialized ar4[BABYLON.Vector4];
        target.setRow(0,BF.SetVec4_2(oTens[0], 0, rows[0]));
        target.setRow(1,BF.SetVec4_2(oTens[1], 0, rows[1]));
        target.setRow(2,BF.SetVec4_2(oTens[2], 0, rows[2]));
        target.setRow(3,BF.SetVec4_2([position.x,position.y,position.z], 1, rows[3]))
    }

    static MatTo2DArray(mat4) {
        const ar=mat4._m;
        return [[ar[0],ar[1],ar[2],ar[3]],[ar[4],ar[5],ar[6],ar[7]],[ar[8],ar[9],ar[10],ar[11]],[ar[12],ar[13],ar[14],ar[15]]];
    }

    static Array2DToRotMat(mat3) {
        //converts 3x3 array to babylon rotation matrix
        let mat = BABYLON.Matrix.Identity();
        mat.setRow(0,BF.Vec4_2(mat3[0],0));
        mat.setRow(1,BF.Vec4_2(mat3[1],0));
        mat.setRow(2,BF.Vec4_2(mat3[2],0));
        return mat;
    }

    static Vec3(ar3) {
        return new BABYLON.Vector3(ar3[0],ar3[1],ar3[2]);
    }

    static SetVec3(ar3, target) {
        target.set(ar3[0],ar3[1],ar3[2]);
        return target;
    }

    static Vec4(ar4) {
        //converts array of length 4 to babylon vec4
        return new BABYLON.Vector4(ar4[0],ar4[1],ar4[2],ar4[3]);
    }

    static ZeroVec3() {
        return BF.Vec3([0,0,0]);
    }

    static ZeroVec4() {
        return BF.Vec4([0,0,0,0]);
    }
    
    static Vec4_2(ar3,w) {
        //converts array of length 3 and one additional number to babylon vec4
        return new BABYLON.Vector4(ar3[0],ar3[1],ar3[2],w);
    }

    static SetVec4_2(ar3,w,target) {
        //converts array of length 3 and one additional number to babylon vec4
        //target is already initialized
        return target.set(ar3[0],ar3[1],ar3[2],w);
    }

    static MakeWorldMatRows() {
        // initializes vec4 to be used to make world mat
        var rows = [];
        for(var i = 0; i < 4; i++) {
            rows.push(BF.ZeroVec4());
        }
        return rows;
    }

    static Mat4(row1,row2,row3,row4) {
        let mat=new BABYLON.Matrix();
        mat.setRow(0,BF.Vec4(row1[0],row1[1],row1[2],row1[3]));
        mat.setRow(1,BF.Vec4(row2[0],row2[1],row2[2],row2[3]));
        mat.setRow(2,BF.Vec4(row3[0],row3[1],row3[2],row3[3]));
        mat.setRow(3,BF.Vec4(row4[0],row4[1],row4[2],row4[3]));
        return mat;
    }

    static Vec3ToAr(vec3) {
        return [vec3.x, vec3.y, vec3.z];
    }

    static AddScaleArToVec3(ar1, ar1Scale, ar2, ar2Scale) {
        // adds 2 ar3 and puts result in Babylon Vec3
        // arrays are scaled before addition
        return BF.Vec3(math.add(math.multiply(ar1,ar1Scale), math.multiply(ar2, ar2Scale)));
    }

    static ListToVec3(arOfAr){
        // [[x1,y1,z1],[x2,y2,z2]] => [BABYLON.Vec3,...]
        arOfAr.forEach(ar => BF.Vec3(ar));
    }

    static BakeMeshs(meshs) {
        // meshs is ar(mesh)
        for(var i = 0; i < meshs.length; i++) {
            meshs[i].bakeCurrentTransformIntoVertices();
        }
    }

    static ForceCompileMaterials(meshs) {
        // meshs is array of Babylon meshs
        // forces computation of materials applied to meshs
        for(var i = 0; i < meshs.length; i++) {
            meshs[i].material.forceCompilation(meshs[i]);
        }
    }

    static ConnectToShadows(mesh, shadows, includeChildren = false) {
        //shadows is array of Babylon shadowgenerators
        for(var i = 0; i < shadows.length; i++) {
            shadows[i].addShadowCaster(mesh, includeChildren);
        }
    }

    static ConnectMeshsToShadows(meshs, shadows, includeChildren = false) {
        //now meshs is array of Babylon Meshes
        for(var i = 0; i < meshs.length; i++) {
            BF.ConnectToShadows(meshs[i], shadows, includeChildren);
        }
    }

    static SetChildren(parent, children) {
        // parent is parent mesh
        // children is array of meshs to be set as children
        for(var i = 0; i < children.length; i++) {
            children[i].parent = parent;
        }
    }

    static MakeGridXZ(corner, distance, numX, numZ) {
        // corner is the -x, -z corner of grid (ar3)
        // distance is distance between the gridpoints
        // numX/Z is number of x/z gridpoints
        let grid = [];
        for(var i = 0; i < numX; i++) {
            let row = [];
            for(var j = 0; j < numZ; j++) {
                row.push(BF.Vec3(math.add(corner, [i*distance, 0, j*distance])));
            }
            grid.push(row);
        }
        return grid;
    }

    static Hide(mesh) {
        mesh.setEnabled(false);
    }

    static Show(mesh) {
        mesh.setEnabled(true);
    }

    static HideMeshs(meshs) {
        for(var i = 0; i < meshs.length; i++) {
            meshs[i].setEnabled(false);
        }
    }

    static ShowMeshs(meshs) {
        for(var i = 0; i < meshs.length; i++) {
            meshs[i].setEnabled(true);
        }
    }

    static SetMaterial(material, meshs, preCompile = true) {
        for(var i = 0; i < meshs.length; i++) {
            meshs[i].material = material;
        }
        if(preCompile) {
            BF.ForceCompileMaterials(meshs);
        }
    }
}

export class MyMats {
    // a collection of initialized Babylon Materials used in various anims
    constructor(scene) {
        //
        this.lightBlue = new BABYLON.StandardMaterial('lightBlue', scene);
        this.lightBlue.diffuseColor = new BABYLON.Color3(.2,.6,.9);

        this.olive = new BABYLON.StandardMaterial('olive', scene);
        this.olive.diffuseColor = Colors.RGB(128,128,0);

        this.yellow = new BABYLON.StandardMaterial('yellow', scene);
        this.yellow.diffuseColor = Colors.RGB(255,255,0);

        this.red = new BABYLON.StandardMaterial('red', scene);
        this.red.diffuseColor = Colors.RGB(255,0,0);

        this.blue = new BABYLON.StandardMaterial('blue', scene);
        this.blue.diffuseColor = Colors.RGB(0,0,255);

        this.chill = new BABYLON.StandardMaterial("chill", scene);
        this.chill.diffuseTexture = new BABYLON.Texture("https://images.squarespace-cdn.com/content/537cfc28e4b0785074d4ae25/1471358583532-I9LQ4LV67S3I8Y4XH7DA/?content-type=image%2Fpng", scene);
        
        this.bwPattern = new BABYLON.StandardMaterial("bwPattern", scene);
        this.bwPattern.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/QqKNS1o.png", scene);

        this.blueWavy = new BABYLON.StandardMaterial("bwPattern", scene);
        this.blueWavy.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/CRfSAXN.png", scene);

        this.wArrow = new BABYLON.StandardMaterial("wArrow", scene);
        this.wArrow.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/HhdoVoA.png", scene);

        this.wArrow2 = new BABYLON.StandardMaterial("wArrow2", scene);
        this.wArrow2.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/kczDhDm.png", scene);

        this.xAxis = new BABYLON.StandardMaterial("xAxis", scene);
        this.xAxis.diffuseColor = new BABYLON.Color3(1,0,0);

        this.yAxis = new BABYLON.StandardMaterial("yAxis", scene);
        this.yAxis.diffuseColor = new BABYLON.Color3(0,1,0);

        this.zAxis = new BABYLON.StandardMaterial("zAxis", scene);
        this.zAxis.diffuseColor = new BABYLON.Color3(0,0,1);

        this.zAxis = new BABYLON.StandardMaterial("zAxis", scene);
        this.zAxis.diffuseColor = new BABYLON.Color3(0,0,1);

        this.axesSphere = new BABYLON.StandardMaterial("axesSphere", scene);
        this.axesSphere.diffuseColor = Colors.RGB(200,200,200);

        this.sun = new BABYLON.StandardMaterial('sun', scene);
        this.sun.emissiveColor = Colors.RGB(255,255,100);

        this.moon = new BABYLON.StandardMaterial('moon', scene);
        this.moon.diffuseTexture = new BABYLON.Texture('https://i.imgur.com/i2iDYgn.png', scene);
        this.moon.emissiveColor = Colors.RGB(220,220,220);

        this.darkMoon = new BABYLON.StandardMaterial('darkMoon', scene);
        this.darkMoon.diffuseTexture = this.moon.diffuseTexture;
        this.darkMoon.emissiveColor = Colors.RGB(100,100,100);

        this.galaxy = new BABYLON.StandardMaterial('galaxy', scene);
        this.galaxy.diffuseTexture = new BABYLON.Texture('https://i.imgur.com/eZiIipX.png', scene);
        this.galaxy.emissiveColor = Colors.RGB(150,150,150);

        this.bluePlanet = new BABYLON.StandardMaterial('bluePlanet', scene);
        this.bluePlanet.diffuseTexture = new BABYLON.Texture('https://i.imgur.com/WuDcHxN.png', scene);
        this.bluePlanet.emissiveColor = Colors.RGB(150,150,150);

        this.jupiter = new BABYLON.StandardMaterial('jupiter', scene);
        this.jupiter.diffuseTexture = new BABYLON.Texture('https://i.imgur.com/wAGQBuU.png', scene);

        this.underBlock = new BABYLON.StandardMaterial('underBlock', scene);
        this.underBlock.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/B2vjChP.png", scene);

        this.skyBox = new BABYLON.StandardMaterial("skyBox", scene);
        this.skyBox.backFaceCulling = false;
        this.skyBox.reflectionTexture = new BABYLON.CubeTexture("https://i.imgur.com/0XiOCjt.png", scene);
        this.skyBox.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        this.skyBox.diffuseColor = new BABYLON.Color3(0, 0, 0);
        this.skyBox.specularColor = new BABYLON.Color3(0, 0, 0);

        window.axesMats = [this.xAxis, this.yAxis, this.zAxis, this.axesSphere];
    }
}

export class Colors {
    static RGB(r,g,b) {
        // 0 to 255 instead of 0 to 1;
        return new BABYLON.Color3(r/255, g/255, b/255);
    }
}
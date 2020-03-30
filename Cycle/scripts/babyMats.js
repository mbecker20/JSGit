class MyMats {
    // a collection of initialized Babylon Materials used in various anims
    constructor(scene) {
        //
        this.blue = new BABYLON.StandardMaterial('blue', scene);
        this.blue.diffuseColor = new BABYLON.Color3(.2,.6,.9);

        this.olive = new BABYLON.StandardMaterial('olive', scene);
        this.olive.diffuseColor = Colors.RGB(128,128,0);

        this.yellow = new BABYLON.StandardMaterial('yellow', scene);
        this.yellow.diffuseColor = Colors.RGB(255,255,0);

        this.chill = new BABYLON.StandardMaterial("chill", scene);
        this.chill.diffuseTexture = new BABYLON.Texture("https://images.squarespace-cdn.com/content/537cfc28e4b0785074d4ae25/1471358583532-I9LQ4LV67S3I8Y4XH7DA/?content-type=image%2Fpng", scene);
        
        this.bwPattern = new BABYLON.StandardMaterial("bwPattern", scene);
        this.bwPattern.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/QqKNS1o.png", scene);

        this.blueWavy = new BABYLON.StandardMaterial("bwPattern", scene);
        this.blueWavy.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/CRfSAXN.png", scene);

        this.wArrow = new BABYLON.StandardMaterial("wArrow", scene);
        this.wArrow.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/kczDhDm.png", scene);

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

class Colors {
    static RGB(r,g,b) {
        // 0 to 255 instead of 0 to 1;
        return new BABYLON.Color3(r/255, g/255, b/255);
    }
}

function setUpFlyCam(flyCam,canvas) {
    flyCam.inputs.clear();
    flyCam.inputs.addKeyboard();
    flyCam.inputs.addMouse();
    flyCam.keysUp=[32];
    flyCam.keysDown=[16];
    flyCam.speed=.5;
    flyCam.inputs.add(makeKBRotateInput(canvas));
    flyCam.attachControl(canvas, false);
    return flyCam;
}

function makeKBRotateInput(canvas) {
    var kbRotateInput = function() {
        this._keys = [];
        this.keysLeft = [74];
        this.keysRight = [76];
        this.keysUp = [73];
        this.keysDown = [75];
        this.keysZoomIn = [48];
        this.keysZoomOut = [57];
        this.deltaTheta = .002;
        this.deltaFOV = .005;
        this.fovMin = Math.PI/24;
        this.fovMax = .99*Math.PI/2
    };

    kbRotateInput.prototype.getTypeName = function() {
        return "FlyCameraKeyboardRotateInput";
    };
    kbRotateInput.prototype.getSimpleName = function() {
        return "keyboardRotate";
    };

    kbRotateInput.prototype.attachControl = function(element, noPreventDefault) {
        var _this = this;
        if (!this._onKeyDown) {
            element.tabIndex = 1;
            this._onKeyDown = function(evt) {
                if (
                _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                _this.keysRight.indexOf(evt.keyCode) !== -1 ||
                _this.keysUp.indexOf(evt.keyCode) !== -1 ||
                _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                _this.keysZoomIn.indexOf(evt.keyCode) !== -1 ||
                _this.keysZoomOut.indexOf(evt.keyCode) !== -1
                ) {
                    var index = _this._keys.indexOf(evt.keyCode);
                    if (index === -1) {
                        _this._keys.push(evt.keyCode);
                    }
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                }
            };

            this._onKeyUp = function(evt) {
                if (
                _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                _this.keysRight.indexOf(evt.keyCode) !== -1 ||
                _this.keysUp.indexOf(evt.keyCode) !== -1 ||
                _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                _this.keysZoomIn.indexOf(evt.keyCode) !== -1 ||
                _this.keysZoomOut.indexOf(evt.keyCode) !== -1
                ) {
                    var index = _this._keys.indexOf(evt.keyCode);
                    if (index >= 0) {
                        _this._keys.splice(index, 1);
                    }
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                }
            };
        
            element.addEventListener("keydown", this._onKeyDown, false);
            element.addEventListener("keyup", this._onKeyUp, false);
            BABYLON.Tools.RegisterTopRootEvents(canvas, [
                { name: "blur", handler: this._onLostFocus }
            ]);
        }
    };

    kbRotateInput.prototype.detachControl = function(element) {
        if (this._onKeyDown) {
            element.removeEventListener("keydown", this._onKeyDown);
            element.removeEventListener("keyup", this._onKeyUp);
            BABYLON.Tools.UnregisterTopRootEvents(canvas, [
                { name: "blur", handler: this._onLostFocus }
            ]);
            this._keys = [];
            this._onKeyDown = null;
            this._onKeyUp = null;
        }
    };

    kbRotateInput.prototype.checkInputs = function() {
        //this is where you set what the keys do
        if (this._onKeyDown) {
            var camera = this.camera;
            // Keyboard
            for (var index = 0; index < this._keys.length; index++) {
                var keyCode = this._keys[index];
                if (this.keysLeft.indexOf(keyCode) !== -1) {
                    camera.cameraRotation.y -= this.deltaTheta;
                } else if (this.keysRight.indexOf(keyCode) !== -1) {
                    camera.cameraRotation.y += this.deltaTheta;
                } if (this.keysUp.indexOf(keyCode) !== -1) {
                    camera.cameraRotation.x -= this.deltaTheta;
                } else if (this.keysDown.indexOf(keyCode) !== -1) {
                    camera.cameraRotation.x += this.deltaTheta;
                } if (this.keysZoomIn.indexOf(keyCode) !== -1) {
                    camera.fov -= this.deltaFOV;
                    if(camera.fov < this.fovMin) {
                        camera.fov = this.fovMin;
                    }
                } else if (this.keysZoomOut.indexOf(keyCode) !== -1) {
                    camera.fov += this.deltaFOV;
                    if(camera.fov > this.fovMax) {
                        camera.fov = this.fovMax;
                    }
                }
            }
        }
    };

    return new kbRotateInput();
};




class Lagrangian {
    constructor(func, params, pConst, damping, dx = .01) {
        // params is array of param obj properties (strings)
        // params should have one key for variable, one key for variableDot
        // ie has params.x and params.xDot;
        // works by creating m, mDot (matrices) based on the partial derivs evaluated at current params
        // then mDot * qDD = b - m * qDot = c
        // b = [dL/dq1, dL/dq2, ...], qDot = [q1Dot, q2Dot, ...], qDD = [q1DoubleDot, q2DoubleDot, ...]
        // params ordered {x: x0, xDot: xDot0, y: y0, yDot: yDot0, ...}
        // damping is parameter object with keys xDot, yDot, etc.
        // damping is velocity based to counter the energy addition inherent to the method
        // vf = vi + (vDot - damping*vi)*dt
        this.func = func;
        this.params = params;
        this.pConst = pConst;
        this.pDD = {};
        this.setParamKeys();
        this.setPartialDerivFuncs(dx);
        this.damping = damping;
    }

    step(dt, numTimes = 1) {
        for(var j = 0; j < numTimes; j++) {
            this.setPDD();
            for(var i = 0; i < this.paramKeys.length; i++) {
                this.params[this.paramKeys[i]] += this.params[this.paramDotKeys[i]] * dt;
                this.params[this.paramDotKeys[i]] += (this.pDD[this.paramKeys[i]] - this.damping[this.paramDotKeys[i]] * this.params[this.paramDotKeys[i]]) * dt;
            }
        }
    }

    setPDD() {
        // sets PDD at current params
        var m = [];
        var mDot = [];
        var b = [];
        for(var i = 0; i < this.paramKeys.length; i++) {
            var row = [];
            var rowDot = [];
            for(var j = 0; j < this.paramKeys.length; j++) {
                row.push(this.func[this.paramDotKeys[i]][this.paramKeys[j]](this.params, this.pConst));
                rowDot.push(this.func[this.paramDotKeys[i]][this.paramDotKeys[j]](this.params, this.pConst))
            }
            b.push(this.func[this.paramKeys[i]](this.params, this.pConst));
            m.push(row);
            mDot.push(rowDot);
        }
        var c = math.add(b, math.multiply(math.multiply(m, this.makeQDot()), -1));
        var qDD = math.transpose(math.lusolve(mDot, c))[0];
        GF.SetObjWithKeyVal(this.pDD, this.paramKeys, qDD);
    }

    makeQDot() {
        // returns [q1Dot, q2Dot, ...]
        var qDot = [];
        for(var i = 0; i < this.paramKeys.length; i++) {
            qDot.push(this.params[this.paramDotKeys[i]]);
        }
        return qDot;
    }

    setPartialDerivFuncs(dx) {
        // sets partial and double partial derivs
        // adds functions as methods to main func object;
        var allKeys = Object.keys(this.params);
        for(var i = 0; i < this.paramKeys.length; i++) {
            this.func[this.paramKeys[i]] = MF.MakePartialDerivFunc(this.func, this.paramKeys[i], dx);
            this.func[this.paramDotKeys[i]] = MF.MakePartialDerivFunc(this.func, this.paramDotKeys[i], dx);
            for(var j = 0; j < allKeys.length; j++) {
                this.func[this.paramDotKeys[i]][allKeys[j]] = MF.MakePartialDerivFunc(this.func[this.paramDotKeys[i]], allKeys[j], dx);
            }
        }
    }

    setParamKeys() {
        // sets this.paramKeys and this.paramDotKeys
        this.paramKeys = [];
        this.paramDotKeys = [];
        var allKeys = Object.keys(this.params);
        for(var i = 0; i < allKeys.length; i++) {
            if(allKeys[i].slice(allKeys[i].length - 3) === 'Dot') {
                this.paramDotKeys.push(allKeys[i]);
            } else {
                this.paramKeys.push(allKeys[i]);
            }
        }
    }
}
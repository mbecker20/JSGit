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

class SplitLagrangian {
    constructor(funcs, params, pConst, damping, dx = .01) {
        // funcs is array of functions for terms in lagrangian
        // each func has property paramKeys
        // paramKeys is ar(string) for all parameters in the term;
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
        this.funcs = funcs;
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

    stepCorrected(dt, numTimes = 1) {
        // slight correction by averaging this and next step velocity
        for(var j = 0; j < numTimes; j++) {
            this.setPDD();
            for(var i = 0; i < this.paramKeys.length; i++) {
                const vNext = this.params[this.paramDotKeys[i]] + (this.pDD[this.paramKeys[i]] - this.damping[this.paramDotKeys[i]] * this.params[this.paramDotKeys[i]]) * dt
                this.params[this.paramKeys[i]] += .5 * (this.params[this.paramDotKeys[i]] + vNext) * dt;
                this.params[this.paramDotKeys[i]] = vNext
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
                row.push(this.pdfs[this.paramDotKeys[i]][this.paramKeys[j]](this.params, this.pConst));
                rowDot.push(this.pdfs[this.paramDotKeys[i]][this.paramDotKeys[j]](this.params, this.pConst))
            }
            b.push(this.pdfs[this.paramKeys[i]](this.params, this.pConst));
            m.push(row);
            mDot.push(rowDot);
        }
        console.log(b);
        console.log(m);
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
        this.pdfs = {} // partial deriv funcs
        this.setStandardPartialDerivs(dx);
        this.setDottedPartialDerivs(dx)
    }

    setStandardPartialDerivs(dx) {
        // sets dL/dq, for standard (non-dotted) params
        // also sets relevant first partial derivs with respect to dotted coords
        for(var i = 0; i < this.paramKeys.length; i++) {
            var funcsWithParamKey = [];
            for(var j = 0; j < this.funcs.length; j++) {
                if(GF.StringIn(this.paramKeys[i], this.funcs[j].paramKeys)) {
                    funcsWithParamKey.push(this.funcs[j])
                }
                if(GF.StringIn(this.paramDotKeys[i], this.funcs[j].paramKeys)) {
                    this.funcs[j][this.paramDotKeys[i]] = MF.MakePartialDerivFunc(this.funcs[j], this.paramDotKeys[i], dx);
                }
            }
            this.pdfs[this.paramKeys[i]] = MF.MakePartialDerivFuncMult(funcsWithParamKey, this.paramKeys[i], dx);
        }
    }

    setDottedPartialDerivs(dx) {
        for(var i = 0; i < this.paramKeys.length; i++) {
            this.pdfs[this.paramDotKeys[i]] = {};
            for(var j = 0; j < this.paramKeys.length; j++) {
                var funcsWithDotAndStandardKey = [];
                var funcsWithDotAndDotKey = [];
                for(var k = 0; k < this.funcs.length; k++) {
                    if(GF.BothStringsIn(this.paramDotKeys[i], this.paramKeys[j], this.funcs[k].paramKeys)) {
                        funcsWithDotAndStandardKey.push(this.funcs[k][this.paramDotKeys[i]])
                    }
                    if(GF.BothStringsIn(this.paramDotKeys[i], this.paramDotKeys[j], this.funcs[k].paramKeys)) {
                        funcsWithDotAndDotKey.push(this.funcs[k][this.paramDotKeys[i]]);
                    }
                }
                this.pdfs[this.paramDotKeys[i]][this.paramKeys[j]] = MF.MakePartialDerivFuncMult(funcsWithDotAndStandardKey, this.paramKeys[j], dx);
                this.pdfs[this.paramDotKeys[i]][this.paramDotKeys[j]] = MF.MakePartialDerivFuncMult(funcsWithDotAndStandardKey, this.paramDotKeys[j], dx);
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
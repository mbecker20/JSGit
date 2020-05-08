class PendSystem {
    constructor(m1,m2,l0,ldot0,theta0,thetadot0,Ltot,alpha,dt,grav) {
        this.m1=m1;
        this.m2=m2;
        this.l=l0;
        this.ldot=ldot0;
        this.theta=theta0;
        this.thetadot=thetadot0;
        this.Ltot=Ltot;
        this.dt=dt;
        this.alpha=alpha;
        this.rectLengthHeight=[60,30];
        this.m1rad=20
        this.m2corners=this.getM2corners(); //list of the vertices of the rectangle centered at origin
        this.pivot=[400,100];
        this.pivotrad=15
        this.grav=grav;
        this.PEconst=8870;
        this.setupGraphs();
        this.setupUI();
        this.steppingToMouse=false
    }

    stepAnim() {
        this.updatePicture();
        if(!this.steppingToMouse) {
            if(!this.settingsButton.mouseIn()) {
                if (mouseIsPressed && 
                    !this.lPhaseGraphCheck.mouseIn() && 
                    !this.gravSlider.mouseIn() && 
                    !this.gravSlider.sliding) {
                    this.steppingToMouse=true
                    this.stepToMouse();
                } else {
                    this.step();
                }
            } else {
                this.step();
            }
        } else {
            this.stepToMouse();
            this.steppingToMouse=mouseIsPressed;
        }
    }

    stepAnim2() {
        this.updatePicture();
        if(!this.steppingToMouse) {
            if(!this.settingsButton.mouseIn()) {
                if (mouseIsPressed && 
                    !this.posGraphCheck.mouseIn() && 
                    !this.energyGraphCheck.mouseIn() && 
                    !this.gravSlider.mouseIn() && 
                    !this.gravSlider.sliding) {
                    this.steppingToMouse=true
                    this.stepToMouse();
                } else {
                    this.step();
                }
            } else {
                this.step();
            }
        } else {
            this.stepToMouse();
            this.steppingToMouse=mouseIsPressed;
        }
    }

    step() {
        //no correction for now
        let ldd=this.getlDoubleDot();
        let tdd=this.getThetaDoubleDot();
        this.l=this.l+this.ldot*this.dt;
        if (this.l>(this.Ltot-this.rectLengthHeight[0]/2)) {
            this.l=this.Ltot-this.rectLengthHeight[0]/2
            this.ldot=0
        }
        if (this.l<this.m1rad) {
            this.l=this.m1rad
            this.ldot=0
        }
        this.ldot=this.ldot+ldd*this.dt;
        this.theta=this.theta+this.thetadot*this.dt;
        if(this.theta<0){
            this.theta=2*PI+this.theta
        } else {
            this.theta=this.theta%(2*PI)
        }
        this.thetadot=this.thetadot+tdd*this.dt;
    }

    stepToMouse() {
        const vecToMouse=[mouseX-this.pivot[0],mouseY-this.pivot[1]];
        const ltheta=VF.toPolar(vecToMouse[1],-vecToMouse[0]); //array with first val l, second val theta
        const deltal=(1/10)*(ltheta[0]-this.l)
        const deltaTheta=(1/10)*(VF.shortestAzimRoute(this.theta,ltheta[1]))
        this.l=this.l+deltal
        if(this.l>this.Ltot-this.rectLengthHeight[0]/2) {
            this.l=this.Ltot-this.rectLengthHeight[0]/2
        }
        this.theta=this.theta+deltaTheta
        if(this.theta<0){
            this.theta=2*PI+this.theta
        } else {
            this.theta=this.theta%(2*PI)
        }
        const v=math.multiply(1/(2*this.dt),[mouseX-pmouseX,mouseY-pmouseY])
        this.ldot=-v[0]*math.sin(this.theta)+v[1]*math.cos(this.theta)
        this.thetadot=(1/this.l)*(-v[0]*cos(this.theta)-v[1]*math.sin(this.theta)) 
    }

    getlDoubleDot() {
        let ldd=(1/(1+(this.m2/this.m1)))*(this.grav*(math.cos(this.theta)-(this.m2/this.m1)*math.sin(this.alpha))+this.l*Math.pow(this.thetadot,2))
        return ldd;
    }

    getThetaDoubleDot() {
        let tdd=(1/this.l)*(-2*this.ldot*this.thetadot-this.grav*math.sin(this.theta))
        return tdd;
    }

    drawStatic() {
        noStroke()
        fill('red')
        circle(this.pivot[0],this.pivot[1],this.pivotrad)
    }

    drawDynamic() {
        fill('blue')
        let m1center=math.add(this.pivot,math.multiply(this.l,[-math.sin(this.theta),math.cos(this.theta)]));
        stroke(255)
        strokeWeight(2)
        line(this.pivot[0],this.pivot[1],m1center[0],m1center[1]);
        circle(m1center[0],m1center[1],this.m1rad);
        let m2center=math.add(this.pivot,math.multiply(this.Ltot-this.l,[math.cos(this.alpha),math.sin(this.alpha)]));
        line(this.pivot[0],this.pivot[1],m2center[0],m2center[1]);
        let m2c=this.m2corners.map(x => math.add(x,m2center));
        quad(m2c[0][0],m2c[0][1],m2c[1][0],m2c[1][1],m2c[2][0],m2c[2][1],m2c[3][0],m2c[3][1]);
    }

    setupGraphs() {
        this.lGraph=new Graph2D('L Graph',300,200,[1000,200],[-.2,10],[-1,this.Ltot+1]);
        this.lGraphX=VF.linspace(0,6,50);
        this.lGraphY=VF.zeroes(100);
        this.thetaGraph=new Graph2D('Theta Graph',300,200,[1000,500],[-.2,10],[-PI-.2,PI+.2]);
        this.thetaGraphX=VF.linspace(0,6,50);
        this.thetaGraphY=VF.zeroes(50);
        this.energyGraph=new Graph2D('Energy Graph',300,350,[160,450],[0,10],[0,16000]);
        this.energyGraphKEX=VF.linspace(0,6,50);
        this.energyGraphKEY=VF.zeroes(50);
        this.energyGraphPEX=VF.linspace(0,6,50);
        this.energyGraphPEY=VF.zeroes(50);
        this.lPhaseGraph=new Graph2D('l by l dot',400,400,[900,300],[0,this.Ltot],[-100,100]);
        this.lPhaseGraphLDot=VF.zeroes(100);
    }

    updateGraphs() {
        this.lGraphY.shift();
        this.lGraphY.push(this.l);
        //this.thetaGraphY.shift();
        //this.thetaGraphY.push(this.shiftedTheta());
        //this.energyGraphKEY.shift();
        //this.energyGraphKEY.push(this.getKE());
       // this.energyGraphPEY.shift();
        //this.energyGraphPEY.push(this.getPE());
        this.lPhaseGraphLDot.shift();
        this.lPhaseGraphLDot.push(this.ldot);
    }

    drawGraphs() {
        this.updateGraphs()
        if(this.lPhaseGraphCheck.checked) {
            this.lPhaseGraph.graph([this.lGraphY],[this.lPhaseGraphLDot],[window.LIGHTBLUE]);
        }
    }

    drawGraphs2() {
        this.updateGraphs()
        if(this.posGraphCheck.checked) {
            this.lGraph.graph([this.lGraphX],[this.lGraphY],[window.LIGHTBLUE]);
            this.thetaGraph.graph([this.thetaGraphX],[this.thetaGraphY]);
        } if(this.energyGraphCheck.checked) {
            this.energyGraph.graph([this.energyGraphKEX,this.energyGraphPEX],[this.energyGraphKEY,this.energyGraphPEY],['blue','red'])
        } if(this.lPhaseGraphCheck.checked) {
            this.lPhaseGraph.graph([this.lGraphY],[this.lPhaseGraphLDot],[window.LIGHTBLUE]);
        }
    }

    shiftedTheta() {
        if(this.theta<=PI) {
            return this.theta
        } else {
            return this.theta-2*PI
        }
    }

    updatePicture() {
        if(!keyIsDown(66)) {
            background(0)
        }
        //background(0);
        this.drawGraphs();
        this.drawUI();
        this.drawDynamic();
        this.drawStatic();
    }

    getM2corners() {
        const L=this.rectLengthHeight[0];
        const H=this.rectLengthHeight[1];
        const corners=[[-L/2,H/2],[-L/2,-H/2],[L/2,-H/2],[L/2,H/2]];
        return corners.map(x => VF.rot2D(x,this.alpha));
    }

    getKE() {
        const ke1=(this.m1/2)*(Math.pow(this.ldot,2)+Math.pow(this.l*this.thetadot,2));
        const ke2=(this.m2/2)*Math.pow(this.ldot,2);
        return ke1+ke2;
    }

    getPE() {
        const pe1=-this.m1*this.grav*this.l*math.cos(this.theta)+this.PEconst;
        const pe2=-this.m2*this.grav*(this.Ltot-this.l)*math.sin(this.alpha)+this.PEconst;
        return pe1+pe2;
    }

    setupUI() {
        //this.posGraphCheck=new CheckBox('Position Graphs','Position Graphs',[30,100],30);
        this.lPhaseGraphCheck=new CheckBox('l Phase Graph','l Phase Graph',[30,150],30);
        //this.energyGraphCheck=new CheckBox('Energy Graph','Energy Graph',[30,150],30);
        this.settingsButton=new Button('hide settings', 'show settings',[60,30],110,30,16,false);
        this.gravSlider=new Slider('gravity',[150,200],250,25,[0,100],10,18);
    }

    drawUI() {
        //updates and draws UI. facilitates interaction
        if(!this.steppingToMouse) {
            this.settingsButton.exist();
            if(this.settingsButton.pressed) {
                this.gravSlider.exist();
                this.grav=this.gravSlider.val;
                this.lPhaseGraphCheck.exist();
            }
        } else {
            this.justDrawUI();
        }
    }

    drawUI2() {
        //updates and draws UI. facilitates interaction
        if(!this.steppingToMouse) {
            this.settingsButton.exist();
            if(this.settingsButton.pressed) {
                this.posGraphCheck.exist();
                this.energyGraphCheck.exist();
                this.gravSlider.exist();
                this.grav=this.gravSlider.val;
                this.lPhaseGraphCheck.exist();
            }
        } else {
            this.justDrawUI();
        }
    }

    justDrawUI() {
        //for when stepToMouse is active. UI interaction disabled
        this.settingsButton.draw();
        if(this.settingsButton.pressed) {
            this.gravSlider.draw();
            this.lPhaseGraphCheck.draw();
        }
    }

    justDrawUI2() {
        //for when stepToMouse is active. UI interaction disabled
        this.settingsButton.draw();
        if(this.settingsButton.pressed) {
            this.posGraphCheck.draw();
            this.energyGraphCheck.draw();
            this.gravSlider.draw();
            this.lPhaseGraphCheck.draw();
        }
    }
}
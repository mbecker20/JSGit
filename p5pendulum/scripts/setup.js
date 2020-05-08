function setup() {
    m1=1
    m2=2
    l0=220
    ldot0=0
    theta0=PI/4
    thetadot0=0
    Ltot=700
    alfa=PI/3
    dt=.1
    grav=15

    //colors
    window.TEAL=color('hsl(160, 100%, 50%)')
    window.LIGHTBLUE=color(50,150,255)

    createCanvas(1200,800);
    window.anim=new PendSystem(m1,m2,l0,ldot0,theta0,thetadot0,Ltot,alfa,dt,grav);
}

function draw() {
    window.anim.stepAnim();
}
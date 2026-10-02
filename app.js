const canvas =
document.getElementById("world");

const ctx =
canvas.getContext("2d");

let time = 0;
let frame = 0;
let state = "idle";
let stateTime = 0;
let jumpY = 0;
let nextIdleTime = 60;
let jumpsRemaining = 0;
let walkRemaining = 120;
let walkDuration = 120;
let actionDuration = 120;
let nextWalkTurn = 60;

let posX = 300;
let dir = 1;


// =================================
// PENGATURAN KEPRIBADIAN STICKMAN
// =================================

const personality = {
    idle: 25,
    wave: 25,
    walk: 30,
    jump: 20,
};


// =================================
// POSE
// =================================

const pose = {

    body: 0,

    armL: 105,
    forearmL: 0,

    armR: 75,
    forearmR: 0,

    thighL: 95,
    shinL: 0,

    thighR: 85,
    shinR: 0

};


// =================================
// MEMILIH AKSI BERDASARKAN PELUANG
// =================================

function chooseNextAction(){

    const actions =
    Object.entries(personality);

    const totalWeight =
    actions.reduce(
        (total, action) => total + action[1],
        0
    );

    let random =
    Math.random() * totalWeight;

    for(const [action, weight] of actions){

        random -= weight;

        if(random < 0){

            state = action;
            break;

        }

    }

    stateTime = 0;

    if(state === "jump"){

        jumpsRemaining =
        1 + Math.floor(Math.random() * 3);

    }

    if(state === "walk"){

        walkDuration =
        40 + Math.floor(Math.random() * 201);

        nextWalkTurn =
        30 + Math.floor(Math.random() * 91);

    }

    if (state === "idle"){

        actionDuration =
        120 + Math.floor(Math.random() * 241);

    }

    if(state === "wave"){

        actionDuration = 45;

    }

}


// =================================
// BERDIRI DIAM
// =================================

function idlePose(){

    pose.body = 0;

    pose.armL = 105;
    pose.forearmL = 0;

    pose.armR = 75;
    pose.forearmR = 0;

    pose.thighL = 95;
    pose.shinL = 0;

    pose.thighR = 85;
    pose.shinR = 0;

    jumpY = 0;

}

// =================================
// MELAMBAIKAN TANGAN
// =================================

function wavePose(){

    idlePose();

    const t = stateTime;

    // Naik cepat
    if(t < 10){

        const p = t / 10;

        pose.armR =
        75 - (120 * p);

    }

    // Lambai kanan-kiri di atas kepala
    else if(t < 35){

        pose.armR = -45;

        // Transisi halus
        if(t < 15){

            const p = (t - 10) / 5;

            pose.forearmR = -45 * p;

        }

        // Lambai kanan-kiri
        else{

            pose.forearmR =
            -45 +
            Math.sin(
                (t - 15) * 0.3
            ) * 25;

        }

    }

    // Turun cepat
    else{

        const p =
        Math.min(
            (t - 35) / 10,
            1
        );

        pose.armR =
        -45 + (120 * p);

    }

}


// =================================
// MELOMPAT
// =================================

function jumpPose(){

    idlePose();

    const t = stateTime;

    // Tekuk lutut
    if(t < 10){

        const p = t / 10;

        pose.thighL =
        95 + (15 * p);

        pose.thighR =
        85 + (15 * p);

        jumpY =
        2 * p;

    }

    // Loncat
    else if(t < 40){

        const p =
        (t - 10) / 30;

        jumpY =
        -Math.sin(
            p * Math.PI
        ) * 18;

    }

    // Mendarat
    else if(t < 50){

        const p =
        (t - 40) / 10;

        pose.thighL =
        110 - (15 * p);

        pose.thighR =
        100 - (15 * p);

    }

}


// =================================
// BERLARI
// =================================

function runPose(){

    idlePose();

    const step =
    Math.floor(frame / 4) % 4;

    if(step === 0){

        pose.armL = 130;
        pose.armR = 50;

        pose.thighL = 120;
        pose.thighR = 60;

    }

    if(step === 1){

        pose.armL = 115;
        pose.armR = 65;

        pose.thighL = 105;
        pose.thighR = 75;

    }

    if(step === 2){

        pose.armL = 50;
        pose.armR = 130;

        pose.thighL = 60;
        pose.thighR = 120;

    }

    if(step === 3){

        pose.armL = 65;
        pose.armR = 115;

        pose.thighL = 75;
        pose.thighR = 105;

    }

}


// =================================
// BERJALAN
// =================================

function walkPose(){

    idlePose();

    posX += 0.8 * dir;

    if(stateTime >= nextWalkTurn){

        if(Math.random() < 0.5){

            dir *= -1;

        }

        nextWalkTurn =
        stateTime +
        30 +
        Math.floor(Math.random() * 91);

    }

    const cycle =
    Math.sin(stateTime * 0.18);

    pose.armL =
    90 + cycle * 25;

    pose.armR =
    90 - cycle * 25;

    pose.thighL =
    90 - cycle * 20;

    pose.thighR =
    90 + cycle * 20;

    jumpY =
    Math.abs(
        Math.sin(stateTime * 0.18)
    ) * -1.5;

    if(posX < 50){

        dir = 1;

    }

    if(posX > canvas.width - 50){

        dir = -1;

    }

}


// =================================
// MELIHAT KANAN-KIRI
// =================================

function lookPose(){

    idlePose();

    const step =
    Math.floor(frame / 20) % 2;

    if(step === 0){

        pose.body = -8;

    }
    else{

        pose.body = 8;

    }

}


// =================================
// RESIZE CANVAS
// =================================

function resize(){

    canvas.width =
    window.innerWidth;

    canvas.height =
    window.innerHeight;

}

resize();

window.addEventListener(
    "resize",
    resize
);

const FLOOR_Y = () =>
canvas.height - 120;


// =================================
// LANTAI
// =================================

function drawFloor(){

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
        0,
        FLOOR_Y()
    );

    ctx.lineTo(
        canvas.width,
        FLOOR_Y()
    );

    ctx.stroke();

}


// =================================
// MENGGAMBAR TULANG
// =================================

function drawBone(a, b){

    ctx.beginPath();

    ctx.moveTo(
        a.x,
        a.y
    );

    ctx.lineTo(
        b.x,
        b.y
    );

    ctx.stroke();

}


// =================================
// MENGGAMBAR STICKMAN
// =================================

function drawStickman(){

    const centerX =
    canvas.width / 2;

    const floor =
    FLOOR_Y();

    const HEAD = 5;
    const TORSO = 20;

    const UPPER_ARM = 10;
    const LOWER_ARM = 10;

    const THIGH = 12;
    const SHIN = 12;

    const root = {

        x: posX,

        y:
        floor -
        THIGH -
        SHIN +
        jumpY

    };

    const hip = {

        x: root.x,
        y: root.y

    };

    const shoulder = {

        x:
        hip.x +
        Math.cos(
            (pose.body - 90) *
            Math.PI / 180
        ) *
        TORSO,

        y:
        hip.y +
        Math.sin(
            (pose.body - 90) *
            Math.PI / 180
        ) *
        TORSO

    };

    const head = {

        x:
        shoulder.x +
        Math.cos(
            (pose.body - 90) *
            Math.PI / 180
        ) *
        HEAD,

        y:
        shoulder.y +
        Math.sin(
            (pose.body - 90) *
            Math.PI / 180
        ) *
        HEAD

    };

    const elbowL = {

        x:
        shoulder.x +
        Math.cos(
            (pose.body + pose.armL) *
            Math.PI / 180
        ) *
        UPPER_ARM,

        y:
        shoulder.y +
        Math.sin(
            (pose.body + pose.armL) *
            Math.PI / 180
        ) *
        UPPER_ARM

    };

    const handL = {

        x:
        elbowL.x +
        Math.cos(
            (pose.body + pose.armL + pose.forearmL) *
            Math.PI / 180
        ) *
        LOWER_ARM,

        y:
        elbowL.y +
        Math.sin(
            (pose.body + pose.armL + pose.forearmL) *
            Math.PI / 180
        ) *
        LOWER_ARM

    };

    const elbowR = {

        x:
        shoulder.x +
        Math.cos(
            (pose.body + pose.armR) *
            Math.PI / 180
        ) *
        UPPER_ARM,

        y:
        shoulder.y +
        Math.sin(
            (pose.body + pose.armR) *
            Math.PI / 180
        ) *
        UPPER_ARM

    };

    const handR = {

        x:
        elbowR.x +
        Math.cos(
            (pose.body + pose.armR + pose.forearmR) *
            Math.PI / 180
        ) *
        LOWER_ARM,

        y:
        elbowR.y +
        Math.sin(
            (pose.body + pose.armR + pose.forearmR) *
            Math.PI / 180
        ) *
        LOWER_ARM

    };

    const kneeL = {

        x:
        hip.x +
        Math.cos(
            (pose.body + pose.thighL) *
            Math.PI / 180
        ) *
        THIGH,

        y:
        hip.y +
        Math.sin(
            (pose.body + pose.thighL) *
            Math.PI / 180
        ) *
        THIGH

    };

    const footL = {

        x:
        kneeL.x +
        Math.cos(
            (pose.body + pose.thighL + pose.shinL) *
            Math.PI / 180
        ) *
        SHIN,

        y:
        kneeL.y +
        Math.sin(
            (pose.body + pose.thighL + pose.shinL) *
            Math.PI / 180
        ) *
        SHIN

    };

    const kneeR = {

        x:
        hip.x +
        Math.cos(
            (pose.body + pose.thighR) *
            Math.PI / 180
        ) *
        THIGH,

        y:
        hip.y +
        Math.sin(
            (pose.body + pose.thighR) *
            Math.PI / 180
        ) *
        THIGH

    };

    const footR = {

        x:
        kneeR.x +
        Math.cos(
            (pose.body + pose.thighR + pose.shinR) *
            Math.PI / 180
        ) *
        SHIN,

        y:
        kneeR.y +
        Math.sin(
            (pose.body + pose.thighR + pose.shinR) *
            Math.PI / 180
        ) *
        SHIN

    };

    ctx.strokeStyle = "#111";
    ctx.fillStyle = "#111";

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();

    ctx.arc(
        head.x,
        head.y,
        HEAD,
        0,
        Math.PI * 2
    );

    ctx.fill();

    drawBone(shoulder, hip);

    drawBone(shoulder, elbowL);
    drawBone(elbowL, handL);

    drawBone(shoulder, elbowR);
    drawBone(elbowR, handR);

    drawBone(hip, kneeL);
    drawBone(kneeL, footL);

    drawBone(hip, kneeR);
    drawBone(kneeR, footR);

}


// =================================
// ANIMASI UTAMA
// =================================

function animate(){

    time += 0.05;
    frame++;
    stateTime++;

    // Menyelesaikan satu siklus lompatan
    if(
        state === "jump" &&
        stateTime >= 50
    ){

        jumpsRemaining--;

        if(jumpsRemaining > 0){

            stateTime = 0;

        }
        else{

            chooseNextAction();

        }

    }
    else if(
        state !== "jump" &&
        stateTime >= (
            state === "walk"
            ? walkDuration
            : actionDuration
        )
    ){

        chooseNextAction();

    }

    // Menentukan pose
    if(state === "idle"){

        idlePose();

    }

    if(state === "walk"){

        walkPose();

    }

    if(state === "wave"){

        wavePose();

    }

    if(state === "jump"){

        jumpPose();

    }

    if(state === "run"){

        runPose();

    }

    if(state === "look"){

        lookPose();

    }

    // Menggambar ulang canvas
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawFloor();

    drawStickman();

    requestAnimationFrame(
        animate
    );

}

animate();
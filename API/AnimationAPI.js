
// user API

var animationData = {
    speed : 1000,
    maxSpeed : 100000
}

function getCanvas() {
    return document.getElementById('canvas').getContext("2d");
}

function getCanvasWidth() {
    return 600;
}

function getCanvasHeight() {
    return 300;
}

function setAnimationSpeed(s) {
    if (s>0 && s < maxSpeed) aniamtionData.speed = s;
}

///

// user requirements

//function drawFrame(data);
// function initAnimation();

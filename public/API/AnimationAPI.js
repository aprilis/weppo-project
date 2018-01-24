// user API

var animationData = {
    speed : 1000,
    maxSpeed : 100000,
    canvasSelector: '#viewer canvas',
    eventInterval: null
}

function setCanvasSelector(selector) {
    animationData.canvasSelector(selector);
}

function getCanvas() {
    return $(animationData.canvasSelector)[0].getContext("2d");
}

function getCanvasElement() {
    return $(animationData.canvasSelector)[0];
}

function getCanvasWidth() {
    return $(animationData.canvasSelector).prop('width');
}

function getCanvasHeight() {
    return $(animationData.canvasSelector).prop('height');
}

function setAnimationSpeed(s) {
    if (s>0 && s <= animationData.maxSpeed){
        animationData.speed = s;
        if(isAnimationPlaying()) {
            playAnimation(); //play with new speed
        }
        return true;
    }
    return false;
}

function isAnimationPlaying() {
    return animationData.eventInterval !== null;
}

function stopAnimation() {
    if(isAnimationPlaying()) {
        clearInterval(animationData.eventInterval);
        animationData.eventInterval = null;
    }
}

function playAnimation() {
    stopAnimation();
    animationData.eventInterval = setInterval(() => {
        $(document).trigger('nextUpdate');
    }, animationData.speed);
}

///

// user requirements

//function drawFrame(data);
//function initAnimation(history);


function drawAnimation(canvas, history) {
    initAnimation();
    var drawer = (function () {
        var pos = 0;

        function draw () {
            if (pos == history.updates.length) pos--;
            drawFrame(history.updates[pos]);
            pos++;
        }

        return draw;
    })();

    setInterval(drawer, animationData.speed);
}


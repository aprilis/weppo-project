    const root = new createjs.Stage(getCanvasElement());
    const stage = new createjs.Container();
    root.addChild(stage);
    const size = 120;
    stage.x = (getCanvasWidth() - size * 3) / 2;
    
    function makeLine(x1, y1, x2, y2) {
        const line = new createjs.Shape();
        line.graphics
            .setStrokeStyle(5)
            .beginStroke('gray')
            .moveTo(x1, y1)
            .lineTo(x2, y2);
        stage.addChild(line);
    }

    function centerReg(obj) {
        const bounds = obj.getBounds();
        obj.regX = bounds.width / 2;
        obj.regY = bounds.height / 2;
    }

    //grid
    [size, size * 2].forEach(x => {
        makeLine(x, 0, x, size * 3);
        makeLine(0, x, size * 3, x);
    });

    circles = [];
    crosses = [];

    //objects
    for(var i = 0; i < 3; i++) {
        circles[i] = [];
        crosses[i] = [];
        for(var j = 0; j < 3; j++) {
            const cross = new createjs.Text('X', '70px Arial', 'black');
            cross.x = (i + 0.5) * size;
            cross.y = (j + 0.5) * size;
            centerReg(cross);
            cross.alpha = 0;
            crosses[i][j] = cross;
            stage.addChild(cross);

            const circle = new createjs.Text('O', '70px Arial', 'black');
            circle.x = (i + 0.5) * size;
            circle.y = (j + 0.5) * size;
            centerReg(circle);
            circle.alpha = 0;
            circles[i][j] = circle;
            stage.addChild(circle);
        }
    }

    function initAnimation(history) {
        setAnimationSpeed(1000);
    }

    function animate(object, target) {
        if(object.alpha == target) {
            return;
        }
        createjs.Tween.get(object).to({
            alpha: target,
        }, 800, createjs.Ease.getPowInOut(4));
    }

    function drawFrame(data) {
        for(var i = 0; i < 3; i++) {
            for(var j = 0; j < 3; j++) {
                const targetCircle = data.description.board[i][j] == 0 ? 1 : 0;
                const targetCross = data.description.board[i][j] == 1 ? 1 : 0;
                animate(circles[i][j], targetCircle);
                animate(crosses[i][j], targetCross);
            }
        }
    }

    root.update();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", root);

function resetViewer(viewer) {
    viewer.find('.game-navigator *').removeClass('disabled').off('click');
    updatePlayButton(viewer);
}

function updatePlayButton(viewer) {
    if(isAnimationPlaying()) {
        viewer.find('.play').removeClass('fa-play').addClass('fa-pause');
    } else {
        viewer.find('.play').removeClass('fa-pause').addClass('fa-play');
    }
}

function updateTurn(viewer, currentTurn, allTurns) {
    viewer.find('.game-current-turn-number').text(currentTurn + '/' + allTurns);
}

function viewGame(viewerId, history) {
    const viewer = $('#' + viewerId);
    const turns = history.updates[history.updates.length-1].turn;
    var currentUpdate;

    function setCurrentUpdate(update) {
        currentUpdate = update;
        const current = history.updates[currentUpdate];
        updateTurn(viewer, current.turn, turns);
        drawFrame(current);
    }

    resetViewer(viewer);
    initAnimation(history);

    stopAnimation();
    $(document).off('nextUpdate');
    $(document).on('nextUpdate', () => {
        if(currentUpdate + 1 < history.updates.length) {
            setCurrentUpdate(currentUpdate + 1);
        } else {
            stopAnimation();
            updatePlayButton(viewer);
        }
    });
    setCurrentUpdate(0);

    viewer.find('.play').on('click', () => {
        if(isAnimationPlaying()) {
            stopAnimation();
        } else {
            if(currentUpdate + 1 >= history.updates.length) {
                setCurrentUpdate(0);
            }
            playAnimation();
        }
        updatePlayButton(viewer);
    });

    viewer.find('.play-backward').on('click', () => {
        if(!isAnimationPlaying() && currentUpdate > 0) {
            setCurrentUpdate(currentUpdate - 1);
        }
    });

    viewer.find('.play-forward').on('click', () => {
        if(!isAnimationPlaying() && currentUpdate + 1 < history.updates.length) {
            setCurrentUpdate(currentUpdate + 1);
        }
    });

    playAnimation();
    updatePlayButton(viewer);
}
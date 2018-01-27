function resetViewer(viewer) {
    viewer.off('click', '*');
    viewer.find('.game-navigator-buttons > .btn').removeClass('disabled');
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
    viewer.find('.game-current-turn').text(currentTurn + '/' + allTurns);
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

    viewer.on('click', '.play', () => {
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

    viewer.on('click', '.play-backward', () => {
        if(!isAnimationPlaying() && currentUpdate > 0) {
            setCurrentUpdate(currentUpdate - 1);
        }
    });

    viewer.on('click', '.play-forward', () => {
        if(!isAnimationPlaying() && currentUpdate + 1 < history.updates.length) {
            setCurrentUpdate(currentUpdate + 1);
        }
    });

    playAnimation();
    updatePlayButton(viewer);
}
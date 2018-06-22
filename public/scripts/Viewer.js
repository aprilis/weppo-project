(function() {

    function resetViewer(viewer) {
        viewer.find('.faces img').remove();
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

    function splitStreamLog(stream) {
        return [''].concat(stream.split('END\n'));
    }

    viewGame = function(viewerId, game, faces) {
        var { history, stdin, stdout } = game;
        stdin = splitStreamLog(stdin || '');
        stdout = splitStreamLog(stdout || '');
        const viewer = $('#' + viewerId);
        const turns = history.updates[history.updates.length-1].turn;
        var currentUpdate;

        function updateTurn(currentTurn, allTurns) {
            viewer.find('.game-current-turn-number').text(currentTurn + '/' + allTurns);
            viewer.find('.game-streams-viewer td[type="stdin"] pre').text(stdin[currentTurn] || '');
            viewer.find('.game-streams-viewer td[type="stdout"] pre').text(stdout[currentTurn] || '');
        }

        function setFinalMessage(message) {
            viewer.find('.game-streams-viewer .final-message').text(message || '');
        }

        function setCurrentUpdate(update) {
            currentUpdate = update;
            const current = history.updates[currentUpdate];
            updateTurn(current.turn, turns);
            drawFrame(current);
        }

        $('.game-viewer').each(function() {
            resetViewer($(this));
        });
        setCanvasSelector('#' + viewerId + ' canvas');
        initAnimation(history);

        if(faces) {
            const faceElem = viewer.find('.faces');
            const colors = getColors();
            game.users.forEach((user, i) => {
                faceElem.append('<img src="/mordy/' + user + '.jpg" style="outline-color: ' + colors[i] + '"></img>');
            });
        }

        stopAnimation();
        $(document).off('nextUpdate');
        $(document).on('nextUpdate', () => {
            if(currentUpdate + 1 < history.updates.length) {
                setCurrentUpdate(currentUpdate + 1);
                setFinalMessage();
            } else {
                var message;
                if(history.results[0] == 1 && history.results[1] == 1) {
                    message = 'Draw';
                } else if(history.results[0] == 1) {
                    message = 'You win';
                } else {
                    message = 'You lose';
                    history.fails.forEach(fail => {
                        if(fail.player == 0) {
                            message += ', reason: ' + fail.reason;
                        }
                    });
                }
                setFinalMessage(message);
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

        if(window.dontAutoplay != true) {
            playAnimation();
        }
        updatePlayButton(viewer);
    }

})();

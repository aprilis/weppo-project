function initRankingMatches(room, userName) {
    const socket = io('/league', {
        query: {
            room: room
        }
    });
    const ids = {};
    var count = 1;

    function addMatch(id) {
        if(ids[id]) {
            return;
        }
        ids[id] = true;
        const row = $('<a class="list-group-item"> Match #' + count + ' </a>');
        row.click(function(e) {
            e.preventDefault();
            $that = $(this);

            $that.parent().find('a').removeClass('active');
            $that.addClass('active');

            fetch('/league/battle/' + id, {
                credentials: 'include' 
            })
                .then(response => response.json())
                .then(response => {
                    if(response.success) {
                        console.log(response);
                        viewGame('ranking-viewer', response, true);
                    } else {
                        showModal(response.error.title, response.error.message);
                    }
                })
                .catch(e => {
                    console.error(e);
                    showModal('Unexpected error', e.message);
                });
        });
        $('#matches .list-group').prepend(row)
        count++;
    }

    socket.on('update', (id, result) => {
        if(result == 'Finished') {
            addMatch(id);
        }
    });

    fetch('/league/battles/' + room, {
        credentials: 'include'
    })
        .then(response => response.text())
        .then(response => {
            console.log(response);
            return response;
        })
        .then(response => JSON.parse(response))
        .then(response => {
            if(response.success) {
                response.battles.map(addMatch);
            }
        })
        .catch(console.error);
}
function initLiveRanking(room, userName) {
    const socket = io('/ranking', {
        query: {
            room: room
        }
    });
    socket.on('update', leaderboard => {
        const table = $('#leaderboard tbody');
        table.empty();
        leaderboard.forEach((entry, i) => {
            const score = Math.round(entry.score * 10000) / 100;
            table.append('<tr><td>' + (i + 1) + '</td><td>' +
                 entry.user + '</td><td>' + score + '</td></tr>');
        });
    });
}
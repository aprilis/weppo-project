function showModal(title, message) {
    $('#modal-error .modal-title').text(title);
        $('#modal-error .modal-body').text(message);
        $('#modal-error').modal();
}
$('#quick-fight-button').click(function() {
    const data = new FormData();
    data.append('game', gameID);
    data.append('code', codeEditorFile('editor'));
    data.append('language', codeEditorLanguage('editor'));
    data.append('opponent', $('#opponent').data('value'));
    $(this).addClass('disabled');

    fetch('/submit/quick-fight', {
        method: 'post',
        credentials: 'include',
        body: data
    })
    .then(response => response.json())
    .then(response => {
        if(response.success) {
            viewGame('viewer', response);
        } else {
            showModal(response.error.title, response.error.message);
        }
        $(this).removeClass('disabled');
    })
    .catch(e => {
        console.error(e);
        showModal('Unexpected error', e.message);
        $(this).removeClass('disabled');
    });
});
$('#submit-button').click(function() {
    const data = new FormData();
    data.append('game', gameID);
    data.append('code', codeEditorFile('editor'));
    data.append('language', codeEditorLanguage('editor'));
    const url = new URL(document.URL);
    const saveTo = url.searchParams.get('saveto');
    if(saveTo) {
        data.append('saveTo', saveTo);
    }
    $(this).addClass('disabled');

    fetch('/submit/ranking', {
        method: 'post',
        credentials: 'include',
        body: data
    })
    .then(response => response.json())
    .then(response => {
        if(response.success) {
            $('.nav-pills a[href="#leaderboard"]').click();
        } else {
            showModal(response.error.title, response.error.message);
        }
        $(this).removeClass('disabled');
    })
    .catch(e => {
        console.error(e);
        showModal('Unexpected error', e.message);
        $(this).removeClass('disabled');
    });
});
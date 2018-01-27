function initCodeEditors(languages) {
    //code from https://codepen.io/Sebus059/pen/MwMQbP
    (function bs_input_file() {
        $(".input-file").each(
            function() {
                var element = $(this).prev();
                element.change(function(){
                    element.next(element).find('input').val((element.val()).split('\\').pop());
                });
                $(this).find("button.btn-choose").click(function(){
                    element.click();
                });
                $(this).find("button.btn-reset").click(function(){
                    element.val(null);
                    $(this).parents(".input-file").find('input').val('');
                });
                $(this).find('input').css("cursor","pointer");
                $(this).find('input').mousedown(function() {
                    $(this).parents('.input-file').prev().click();
                    return false;
                });
            }
        );
    })();

    $('.code-editor-container').each(function() {
        var element = $(this).find('.code-editor');
        var editor = ace.edit(element[0]);
        editor.$blockScrolling = Infinity;
        var dropdown = $(this).find('.dropdown');
        var file = $(this).find('input[type="file"]');
        function updateLanguage() {
            var lang = dropdown.data('value');
            editor.getSession().setMode('ace/mode/' + languages[lang].editor);
        }
        function updateCode() {
            element.data('value', editor.getSession().getValue());
        }
        var lastModified = 0;
        function loadCodeFromFile() {
            const f = file[0].files[0];
            lastModified = f.lastModified;
            const reader = new FileReader();
            reader.onload = event => {
                editor.getSession().setValue(event.target.result);
                updateCode();
            }
            reader.readAsText(f);
        }
        function enableEditor() {
            editor.setOptions({
                readOnly: false
            });
            editor.container.style.opacity = 1;
        }
        function disableEdtior() {
            editor.setOptions({
                readOnly: true
            });
            editor.container.style.opacity = 0.5;
        }
        updateLanguage();
        updateCode();
        dropdown.on('change', updateLanguage);
        editor.getSession().on('change', updateCode);
        $(this).find('button.btn-reset').click(enableEditor);
        file.change(() => {
            disableEdtior();
            loadCodeFromFile();
        });
        if(file.val()) {
            disableEdtior();
            loadCodeFromFile();
        }

        setInterval(() => {
            if(file[0].files[0] && file[0].files[0].lastModified > lastModified) {
                loadCodeFromFile();
            }
        }, 2000);
    });

    //returns promise to the contents of file
    codeEditorText = function(editorId) {
        const editor = $('#' + editorId);
        const file = editor.find('input[type="file"]')[0];
        if(file.files[0]) {
            return new Promise((res, rej) => {
                const reader = new FileReader();
                reader.onload = event => res(event.target.result);
                reader.readAsText(file.files[0]);
            });
        } else {
            return new Promise((res, rej) => {
                res(editor.find('.code-editor').data('value'));
            });
        }
    };

    //returns chosen file
    codeEditorFile = function(editorId) {
        const editor = $('#' + editorId);
        const file = editor.find('input[type="file"]')[0];
        if(file.files[0]) {
            return file.files[0];
        } else {
            return new Blob([editor.find('.code-editor').data('value')]);
        }
    };

    codeEditorLanguage = function(editorId) {
        return $(`#${editorId} .dropdown`).data('value');
    }
}
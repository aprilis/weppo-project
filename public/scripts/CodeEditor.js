function initCodeEditors(languages) {
    //code from https://codepen.io/Sebus059/pen/MwMQbP
    (function bs_input_file() {
        $(".input-file").before(
            function() {
                if ( ! $(this).prev().hasClass('input-ghost') ) {
                    var element = $("<input type='file' class='input-ghost' style='visibility:hidden; height:0'>");
                    element.attr("name",$(this).attr("name"));
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
                    return element;
                }
            }
        );
    })();

    $('.code-editor-container').each(function() {
        var element = $(this).find('.code-editor');
        var editor = ace.edit(element[0]);
        var dropdown = $(this).find('.dropdown');
        function updateLanguage() {
            var lang = dropdown.data('value');
            editor.getSession().setMode('ace/mode/' + languages[lang].editorCode);
        }
        function updateCode() {
            element.data('value', editor.getSession().getValue());
        }
        updateLanguage();
        updateCode();
        dropdown.on('change', updateLanguage);
        editor.getSession().on('change', updateCode);
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
}
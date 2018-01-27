$(".dropdown-menu li a").click(function() {
    const dropdown = $(this).parents(".dropdown");
    dropdown.find('.btn').html($(this).text() + ' <span class="caret"></span>');
    const value = $(this).data('value');
    dropdown.data('value', value).trigger('change', value);
});
$(document).ready(function () {
    $.ajax({
        url: '/product/category-list',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            $.each(response, function (key, value) {
                value.forEach(val => {
                    $("#category_id").append('<option value=' + val.id + '>' + val.name + '</option>');
                })

            });
        }
    });
});


$(document).ready(function () {
    $.ajax({
        url: '/product/mainitem-list',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            $.each(response, function (key, value) {
                value.forEach(val => {
                    $("#mainitem_id").append('<option value=' + val.id + '>' + val.name + '</option>');
                })

            });
        }
    });
});
$(document).ready(function(){
    $('table').tablesort();
    $('.edit.icon').click(function(){
        //$('.termEdit').toggleClass("display");
        $('.termEdit').toggle(300);
    });
    $('.button.remove').click(function(){
        $('.ui.modal.removeTerm').modal('show');
    });
    $('#nob').click(function(){
        $('.ui.modal.removeTerm').modal('hide');
    });

    $('button.deleteStudent').click(function(){
        var sele = "div[name=" + $(this).attr('name') + "]";
        $(sele).modal('show');
    });

    $('button.notDeleteStudent').click(function(){
        var sele = "div[name=" + $(this).attr('name') + "]";
        $(sele).modal('hide');
    });


    $('#EditTermName').click(function(){
        $('.EditSegment').toggle(300);
    });
    $('#discard').click(function(){
        $('.termEdit').fadeOut(300);
        $('.EditSegment').fadeOut(300);
    });
    $('input.student').dblclick(function(){
        $(this).css("border", "1px solid blue");
        $(this).removeAttr("readonly");
    });
    $('input.student').change(function(){
        $(this).css("border", "0");
        $(this).prop('readonly', true);
        var address = $(this).attr("name");
        var text = $(this).val();
        console.log(address);
        $.post(address, {value : text});
    });
    $('button.confirmDeleteStudent').click(function(){
        var address=$(this).attr("name");
        console.log(address);
        $.post(address, {value: "true"});
    });

});
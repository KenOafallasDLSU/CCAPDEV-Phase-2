function checkSeatForm(){
    checked = $("input[type=checkbox]:checked").length;

    if(!checked) {
        $("#noSeatAlert").html("Please select at least one seat for checkout!");
        $("#noSeatAlert").addClass("alert alert-danger col-12");
        return false;
    }
    else{
        return true;
    }
}

$(document).ready(function() {
    $.post("getSeatStatus", {slot: localStorage.getItem("selectedSlot")}, function(data, status) {
        data.forEach((item, i) => {
            if(item.status == "U" || item.status == "R")
                $("#".concat(item.seatNum)).attr("disabled", true);
        });
    });   

    if($("input[type=checkbox]:disabled").length == 100)
    {
        $("#noSeatAlert").html("SOLD OUT! There are no more available seats.");
        $("#noSeatAlert").addClass("alert alert-danger col-12");

        $("#seatSubmit").attr("disabled", true);
    }

    $("input[type=checkbox]:not(:checked)").click(function(){
        $("#noSeatAlert").html("");
        $("#noSeatAlert").removeClass("alert alert-danger col-12");
    });

    $("#seatSubmit").click(function(){
        var reservedSeats = [];

        var i = 0, j = 0;
        var letter = 'A';
        var number = 1;

        for(i = 0; i < 10; i++)
        {
            for(j = 0; j < 10; j++)
            {
                if($("#".concat(String.fromCharCode(letter.charCodeAt() + i).concat(number + j))).checked)
                    reservedSeats.push(String.fromCharCode(letter.charCodeAt() + i).concat(number + j));
            }
        }

        if(checkSeatForm() == true)
        {
            $.post("reserveSeats", {slot: localStorage.getItem("selectedSlot"), reservedSeats: reservedSeats}, function(data, status) {
                if(data.success) {
                }
            });
        }
    });
});
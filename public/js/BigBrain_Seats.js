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
    /*
    var i = 0, j = 0;
    for(i = 0; i < 10; i++)
    {
        for(j = 0; j < 10; j++)
         {
            $("#".concat(String.fromCharCode(letter.charCodeAt() + i).concat(number + j))).attr("disabled", true);

                
                $.post("getSeatStatus", screeningInfo, function(data, status) {
                    if(data.success) {
                        if(result.status == "D")
                        {
                            $($String.fromCharCode(letter.charCodeAt() + i).concat(number + j)).attr("disabled", true);
                        }
                    }
                });
                
        }
    }
    */

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

    /*
    $("#seatSubmit").click(function(){
        var reservedSeats = [];

        i = 0; j = 0;
        for(i = 0; i < 10; i++)
        {
            for(j = 0; j < 10; j++)
            {
                if(//its checked)
                    reservedSeats.push(//The id);
            }
        }

        if(checkSeatForm() == true)
        {
            $.post("updateReservedSeats", reservedSeats, function(data, status) {
                if(data.success) {
                }
            });
        }
    });
    */
});
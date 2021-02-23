function checkCreditCardNum() {
    let cred = $('#cardnum').val()
    let digits = cred.length
    console.log(cred)
    console.log(digits)
    console.log(Number.isInteger(cred))
    console.log(isNaN(cred))
    if (digits != 16 ) {
        $("#credAlert").html("Credit Card Number must be 16 digits!");
        $("#credAlert").addClass("alert alert-danger col-12");
        return false
    }
    else if (isNaN(cred)) {
        $("#credAlert").html("Credit Card Number must only contain numbers!");
        $("#credAlert").addClass("alert alert-danger col-12");
        return false
    }
    else return true;

}
$(document).ready(function () {
    $('#checkout').click(function(){
        $("#credAlert").html("");
        $("#credAlert").removeClass("alert alert-danger col-12");
        if (checkCreditCardNum()) {
            window.location = '/transactions';
        }
    })
    $('#cancel').click(function(){
        $("#credAlert").html("");
        $("#credAlert").removeClass("alert alert-danger col-12");
        //console.log("in seat submit")


            //console.log(reservedSeats)
        $.post("/cancelSeats", function(req, res) {
        })
        window.location = '/movies';
    })
})
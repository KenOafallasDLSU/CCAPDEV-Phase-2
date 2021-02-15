$(document).ready( function (){
//login page functions
  $("#user-btn").click(function () {
    $("#typeuser").val("C");
    $(this).addClass("btn-outline-primary");
    $("#employee-btn").removeClass("btn-outline-primary");
  });

  $("#employee-btn").click(function () {
    $("#typeuser").val("E");
    $(this).addClass("btn-outline-primary");
    $("#user-btn").removeClass("btn-outline-primary");
  });
});

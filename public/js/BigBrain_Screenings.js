$(document).ready(function () {
  $('.slotlink').click(function () {
        //localStorage.setItem("selectedSlot", "5ec0c846ca85a61340446897");//hardcoded slot id
        $(location).attr("href", "/seatSelection");
  });
});

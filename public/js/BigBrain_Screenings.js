$(document).ready(function () {
  $('.slotlink').click(function () {
        var link = "/seatSelection/" + $(this).attr("slotid");
        $(location).attr("href", link);
  });
});

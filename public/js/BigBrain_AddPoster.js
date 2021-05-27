function posterError(){
  $("#posterAlert").text("Poster field is required!");
  $("#posterAlert").addClass("alert alert-danger col-6");
}

function posterGood(){
  $("#posterAlert").html("");
  $("#posterAlert").removeClass("alert alert-danger col-6");
}

function checkFile() {
  let valid = true

  if($("#posterSubmit").val()==""){
    posterError()
    valid = false
  }
  else{
    posterGood()
    $('#completeModal').modal({show: true})
  }

  return valid
}

$(document).ready(function() {
  $("#posterSubmit").change(() => {
    const file = $("#posterSubmit")[0].files[0]
    
    if (file) {
      posterGood()
      $("#poster-label").html(file.name)
      $("#uploadPreview").attr("src",URL.createObjectURL(file))
    }
    else{
      $("#poster-label").html("")
      $("#uploadPreview").attr("src","")
      posterError()
    }
  })

  $("#success-confirm").click(() => {
    //location.reload()
    $('#completeModal').modal({show: false})
  })

  $("#submit-form").on("submit", function(e) {
    e.preventDefault();
    const form = $(this)[0];
    const formData = new FormData(form);
    $.ajax({
        url: $(this).attr("action"),
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function() {
            $('#completeModal').modal({show: true})
            $("#modal-message").html("Uploading...");
        },
        success: function(data) {
            $("#modal-message").html("Poster successfully uploaded!");
        }
    });
});
})
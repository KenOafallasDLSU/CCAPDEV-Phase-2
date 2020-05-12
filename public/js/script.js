$(document).ready( function (){
//login page functions
  $('#login').click(function (){
    var email = $('#emaillog').val();
    var password = $('#passlog').val();
    $.post('searchUser', {email: email, password: password}, function(data, status){
        if(!data.ok) {
          alert("Invalid Login");
        } else if (data.cont.usertype == "C") {
          console.log(data.cont.full_name);
          $(location).attr("href", "/movies");
          alert("Welcome " + data.cont.full_name + "!");
        } else {
          $(location).attr("href", "/employeeFacing"); //fill in with link to employee screen
          alert("Welcome " + data.cont.full_name + "!");
        }
    });
  });

  $('#reg').click( function (){
    var email = $('#emailreg').val();
    var password = $('#passreg').val();
    var first_name = $('#fname').val();
    var family_name = $('#lname').val();

    if (email != "" && password != "" && first_name != "" && family_name != "")
    {
      $.post('searchUserExist', {email: email}, function(data, status){
          if (data) {
            alert("Email address already has an existing account.");
          } else if ($('#employee').is(":checked"))
          {
            var newUser = {
              first_name: first_name,
              family_name: family_name,
              email: email,
              password: password,
              usertype: 'E'
            }
            $.post('addUser', newUser, function(data, status) {
              console.log(data);
              console.log(newUser);
              if (data.success) {
                $('#headername').text(newUser.first_name + " " + newUser.family_name);
                alert("Welcome " + newUser.first_name + " " + newUser.family_name + "!");
                $(location).attr("href", "/employeeFacing"); //fill in with link to employee screen
              } else {
                alert("Error. Something wrong with log-in details.");
              }
            });
          } else {
            var newUser = {
              first_name: first_name,
              family_name: family_name,
              email: email,
              password: password,
              usertype: 'C'
            }
            $.post('addUser', newUser, function(data, status) {
              console.log(data);
              console.log(newUser);
              if (data.success) {
                $('#headername').text(newUser.first_name + " " + newUser.family_name);
                alert("Welcome " + newUser.first_name + " " + newUser.family_name + "!");
                $(location).attr("href", "/movies");
              } else {
                alert("Error. Something wrong with log-in details.");
              }
            });
          }
      });
    } else {
      alert("Please fill in all the necessary information.");
    }
  });
});

(function($) {
  $(document).ready(function() {

    firebase.auth()
      .onAuthStateChanged(function(user) {
        if (user) 
        { // User is signed in.
          $(".login-cover").hide();

        } 
        else 
        { // No user is signed in.
          $(".login-cover").show();
        }
      });

    $("#loginBtn").click(function() {
        var email    = $("#loginEmail").val();
        var password = $("#loginPassword").val();

        if (email !== "" && password !== "")
        {
          firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .catch(function(error) {
              console.dir(error);
            });
        }
      });

    $("#signOutBtn").click(function() {
        firebase.auth()
          .signOut()
          .then(function() {
            console.dir('Sign-out successful');
          })
          .catch(function(error) {
            console.dir(error);
          });
    });
    
  });
})(jQuery);
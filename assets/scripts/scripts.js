// Your web app's Firebase configuration
var firebaseConfig = {
apiKey: "AIzaSyDFWV0uUuIm6TGrSnYS4I-YcZKOpYU9Mw8",
authDomain: "rock-paper-scissors-2f70e.firebaseapp.com",
databaseURL: "https://rock-paper-scissors-2f70e.firebaseio.com",
projectId: "rock-paper-scissors-2f70e",
storageBucket: "",
messagingSenderId: "468420946375",
appId: "1:468420946375:web:074901ebe593d5ce"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var choice = "";
var username = "";
var wins = "";
var losses = "";
var playerKey = "";
$("#start-game").on("click", function(event) {
    event.preventDefault();

    name = $("#username").val().trim();

    var userref = database.ref().push();
    playerKey = userref.key;

    var userName = ({
        id: playerKey,
    username: name
    });

    userref.set(userName);
    console.log();
})

$(".choice-btn").on("click", function(event) {
event.preventDefault();

choice = $( this ).text();
console.log(choice);


database.ref().child(playerKey).update({
    choice: choice,
  });


  console.log("The Key is: " + playerKey);
});


database.ref().on("child_added", function(snapshot) {

    var sv = snapshot.val();

})

database.ref().on("value", function(snapshot) {


});
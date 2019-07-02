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

$(".choice-btn").on("click", function(event) {
event.preventDefault();

choice = $( this ).text()

database.ref().push({
    username: name,
    choice: userchoice,
    wins: wins,
    losses: losses

    });

});


database.ref().on("child_added", function(snapshot) {

})
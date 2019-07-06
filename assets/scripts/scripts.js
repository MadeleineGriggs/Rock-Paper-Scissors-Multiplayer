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

var localID = 0;
var remotePlayerIndex;
var name = "";
var roomID = null;
var roomUserID = null;

//When the document is ready, create a unique localID for the player. On the user disconnecting,
// remove the localID.
$(document).ready(function() {
    var ref = database.ref("players/").push();
    localID = ref.key;
    database.ref("players/" + localID).onDisconnect().remove(); 
});

$(".choice-btn").on("click", function(event) {
    event.preventDefault();

    // make sure player is actually in a room
    if (roomID !== null) {
        database.ref("rooms/" + roomID + "/players/" + localID).update({
            move: parseInt($(event.target).attr("moveVal"))
        })
    }
});


function displayRemotePlayerUsername(remUserName) {
    database.ref("players/" + remUserName).once("value").then(function(snapshot){
        var remoteUsername = snapshot.val().username;
        $("#curPlayers").text(name + ", " + remoteUsername);
    })
}


function updateGame(snapshot) {
    var playerCount = snapshot.numChildren();
    if (playerCount > 0) {
        var players = snapshot.val();
        var keys = Object.keys(players);
        $("#curPlayers").text(name);
        if (playerCount == 2) {
            // start playing the game
            localIndex = keys.indexOf(localID)
            remotePlayerIndex = keys[1-localIndex];
            console.log(remotePlayerIndex);
            displayRemotePlayerUsername(remotePlayerIndex)

            var waiting = false;
            for (var i in keys) {
                if (players[keys[i]].move === -1) {
                    waiting = true;

                }
            }
            if (!waiting) {
                localPlayerIndex = keys.indexOf(localID);
                // Line below evaluates who won. It uses the 'moveVal' of the players choice as a math formula, then 
                // returns the character at the calculated value. 
                // The result will always be the result of the local player.  
                result = "TWLLTWWLT".charAt(players[keys[1-localPlayerIndex]].move * 3 + players[keys[localPlayerIndex]].move);
                // Display who one or lost to the players.
                switch (result) {
                    case "W" :
                        $("#game-messages").text("You Won!");
                    break;
                    case "T" :
                        $("#game-messages").text("You Tied with the other player!");
                    break;
                    case "L" :
                        $("#game-messages").text("You Lost!");
                    default:
                    break;
                }

                database.ref("rooms/" + roomID + "/players/" + localID).update({
                    move: -1
                });
                database.ref("players/" + localID).transaction(function(player) {
                    if (player) {
                        switch (result) {
                            case "W":
                                player.wins++;
                                break;
                            case "T":
                                player.ties++;
                                break;
                            case "L":
                                player.losses++;
                                break;
                            default:
                                break;
                        }
                    }
                    return player;
                });
            }
        } else {
            // wait for another player
            $("#game-messages").text("waiting for another player to start the game.");
        }
    }
}

// Lets the player join the room they have selected.
function joinRoom (roomKey) {
    $("#room-modal").toggleClass("hidden");
    $("#game-modal").toggleClass("hidden");
    // Disconnect from current room
    if (roomID !== null) {
        database.ref("rooms/" + roomID + "/players/" + localID).remove();
        database.ref("rooms/" + roomID + "/players/").off();
        roomID = null;
        roomUserID = null;
    }
    // start watching room we will connect to
    database.ref("rooms/" + roomKey + "/players/").on("value", updateGame);
    // Connect to new room
    var ref = database.ref("rooms/" + roomKey + "/players/" + localID);
    ref.set({
        move: -1
    });
    roomID = roomKey;
    database.ref("rooms/" + roomID +"/players/" + localID).onDisconnect().remove();
}



//When the database sees that a room has been added, generate the html for the room name and buttons and append to the 'room-wrapper' area.
database.ref("rooms/").on("value", function(snapshot) {
    roomState = snapshot.val();
    // console.log(roomState)
    //Empty the room wrapper when there is a new room.
    $("#rooms-wrapper").empty();
    
    var html = $("<div>").addClass("room-list");
    
    for (var key in roomState) {
        var line = $("<div>");
        line.addClass("room-line")
        .attr("room-code", key)
        .text("Title: " + roomState[key].title);
        // If there are less than 2 players in a game room, let another player join using
        // the join room button. If there are 2 players the join room button is not available.
        if (snapshot.child(key + "/players/").numChildren() < 2){
            line.append(
                $("<button>")
                .attr("room-code", key)
                .addClass("join-room")
                .text("Join Room")
                .click(function (e) {
                    joinRoom($(e.target).attr("room-code"));
                })
                )
            }
            // When testing I had a delete-room button, so I could easily delete a room. 
            // I don't currently want that, since any user could delete the room...
            // line.append(
                //     $("<button>")
                //         .addClass("delete-room")
                //         .text("Delete Room")
                //         .click(function() {
                    //             deleteRoom(key);
                    //         })
                    // )
                    html.prepend(line);
                }
                $("#rooms-wrapper").append(html);
            });
            
            //Removes the room by pressing the delete room button. Mostly just for ease of testing.
            // function deleteRoom (roomKey) {
            //     database.ref("rooms/" + roomKey).remove();
            
            // }

            // Gets the player's username from the "#username" input and sends to the players section of the database.
    $("#create-player").on("click", function(event) {
        event.preventDefault();
        
        name = $("#username").val().trim();
        
        database.ref('players/' + localID).set({
            username: name,
            wins: 0,
            losses: 0,
            ties: 0
        });
        $("#username-modal").addClass("hidden");
        $("#room-modal").toggleClass("hidden");
        $("#localUsername").text(name);
    });

//Gets the room name from the "#roomTitle" input and sends to the rooms section of the database.
$("#create-room").on("click", function(event) {
    event.preventDefault();
    
    title = $("#roomTitle").val().trim();

    database.ref('rooms/').push({
        title: title,
        history: []
    });
});
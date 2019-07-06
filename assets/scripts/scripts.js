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
var name = "";
var roomID = null;
var roomUserID = null;
var inGame = false;

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

function updateGame(snapshot) {
    var playerCount = snapshot.numChildren();
    if (playerCount > 0) {
        var players = snapshot.val();
        var keys = Object.keys(players);
        console.log(keys);

        if (playerCount == 2) {
            // start playing the game
            var waiting = false;
            for (var i in keys) {
                if (players[keys[i]].move === -1) {
                    waiting = true;
                    console.log("waiting for player" + i + " move")
                }
            }
            if (!waiting) {
                localPlayerIndex = keys.indexOf(localID);
                result = "TWLLTWWLT".charAt(players[keys[1-localPlayerIndex]].move * 3 + players[keys[localPlayerIndex]].move);
                console.log("Match Result: " + result);
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
            console.log("waiting for P2");
        }
    }
}

// Lets the player join the room they have selected.
function joinRoom (roomKey) {
    console.log("Joining room " + roomKey);
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
    inGame = true;
    database.ref("rooms/" + roomID +"/players/" + localID).onDisconnect().remove();
}

function deleteRoom (roomKey) {
    console.log("Deleting room " + roomKey);
    database.ref("rooms/" + roomKey).remove();

}

database.ref("players/").on('value', function(snapshot) {
    // console.log(snapshot);
});

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
        line.append(
            $("<button>")
                .addClass("delete-room")
                .text("Delete Room")
                .click(function() {
                    deleteRoom(key);
                })
        )
        html.prepend(line);
    }
    $("#rooms-wrapper").append(html);
});

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

$("#start-game").on("click", function(event) {
    event.preventDefault();

    

    // database.ref().once('value', function(snapshot) {
    //     if (snapshot.hasChild("game-Room")) {

    //     } else {
    //         database.ref().set("game-Room");
    //         database.ref().set("localPlayerTrack");
    //         database.ref("localPlayerTrack/").set(localPlayer)
    //     }
    // })


    // database.ref('game-Room/').push();


    // var userName = "";

    // database.ref().on('value', function(snapshot) {
    //     if (snapshot.localPlayer == 0) {
    //         console.log("localPlayer Value is 0" + snapshot.localPlayer)
    //         localPlayer = 1;
    //         localPlayerUpdate = ({
    //             localPlayerTrack: '1'
    //         })
    //         database.ref("localPlayer/").set(localPlayerUpdate)

    //         userName = ({
    //             username: name
    //         });
    //         database.ref('game-Room/p1/').set(userName)

    //     } else if (snapshot.localPlayer == "1") {
    //         console.log("localPlayer value is: " + snapshot)
    //         localPlayer = 2;
    //         localPlayerUpdate = ({
    //             localPlayer: 2
    //         })
    //         database.ref("localPlayer/").set(localPlayerUpdate)
    //         userName = ({
    //             username: name
    //         })
    //         database.ref('game-Room/p2/').set(userName)
    //     }
    // })

});

// database.ref("game-Room/").on("child_added", function(snapshot) {
// sv = snapshot.val();
// var player1Location = sv.id;
// console.log("Checking if I can get player location: " + player1Location)
// console.log("checking if location matches to playerKey: " + player1Key)
// })



// database.ref("game-Room/").on("value", function(snapshot) {
//     usersWaiting = snapshot.numChildren();
//     if (usersWaiting == 2) {
//         alert("Two players Ready to play! Lets start...")
//     }
// });

// form variables
var players = {}; // maps players to chip amount
var numBoards = 1;
var pot = 0;
var hands = {}; // maps players to a hand
var boards = []; // list of boards
var manualInput = false;
// var omaha = false;
// $('.rank-symbol').on('click touchstart', selectSuit(this));
// $('.suit-symbol').on('click touchstart', selectSuit(this));
// derived from form variables
var numPlayers = 0;
var player_list = [];


// calculation varialbes
var sidepot = {}; // maps list of players string to sidepot chip count
var winners = []; // list of dictionaries that each map players to winners of the sidepot

// BACK BUTTON AS REQUESTED
var back = [];

function goBack() {
    if (back.length == 0) return;
    document.getElementById("display").innerHTML = "";
    document.getElementById("display").appendChild(back.pop());

}

// callback to add player input entry
function addPlayer() {
    var div = document.createElement('div');
    div.setAttribute('class', 'player-input');
    div.innerHTML = document.getElementsByClassName('player-input')[0].innerHTML;
    document.getElementById("players").appendChild(div);
}

// callback to add board input entry
function addBoard() {
    numBoards++;
    //FIX - ensure empty boards are not counted by the end
    var div = document.createElement('div');
    div.setAttribute('class', 'player-input');
    div.innerHTML = `Board ${numBoards} ` + '<input type="text" id="fboard" class="fcardinput">' + makeButtons(() => i + 1);

    document.getElementById("pot-screen").appendChild(div);
}

// callback to submit player form, deletes the form div and loads the next page
function submitPlayers(manualInput_param = false) {
    manualInput = manualInput_param;
    players = {};
    hands = {};
    var inputs = document.querySelector('#players').querySelectorAll(".player-input");
    try {
        Array.prototype.forEach.call(inputs, element => {

            var name = element.querySelector("#fname").value;
            var chips = element.querySelector("#fchips").value;
            var hand = element.querySelector(".fcardinput").value;
            if (name == "" || chips == "") throw BreakException;
            console.log(hand.length)
            if (!(hand.length == 0 || hand.length == 4 || hand.length == 8)) throw BreakException;

            players[name] = parseInt(chips);
            hands[name] = toInputFormat(hand);
        });;
    } catch (e) {
        console.log('here');
        return;
    }
    player_list = Object.keys(players);
    console.log(player_list)
    numPlayers = player_list.length;
    // console.log('Players: ' + players);
    // console.log(hands);

    var myobj = document.getElementById("player-screen");
    back.push(myobj);
    myobj.remove();


    var codeBlock =
        '<div>' +
        '<button class="button" type="button" onclick="submitPot()">Next</button>';

    if (!manualInput) codeBlock += '<button class="button" type="button" onclick="addBoard()" style="margin-left:20px">+</button>';

    codeBlock +=
        '</div>' +
        '<div class="player-input">' +
        'Pot Size: <input type="number" id="fpot" name="fpot" value=""><br><br>';

    if (manualInput) codeBlock += 'Number of Boards: <input type="number" id="fnumboard" value=""></div>';
    else codeBlock += `</div><div class="player-input">Board ${numBoards} ` + '<input class ="fcardinput" type="text" id="fcardinput" value="">' + makeButtons() + '</div>';

    var div = document.createElement('div');
    div.setAttribute('id', 'pot-screen');
    div.innerHTML = codeBlock;
    document.getElementById("display").appendChild(div);
}

// callback to submit pot form, deletes the form div and loads the next page
function submitPot() {
    if (manualInput) numBoards = parseInt(document.getElementById('fnumboard').value);
    var pot_input = document.getElementById('fpot').value;
    if (pot_input == "") return;
    pot = parseInt(pot_input);
    if (pot < 0) return;

    boards = [];
    document.querySelectorAll('.fcardinput').forEach(input => {
        if (input.value) boards.push(toInputFormat(input.value));
    });
    // console.log(boards);

    var codeBlock = '';

    if (!manualInput) {
        // var div = document.createElement('div');
        // div.setAttribute('id', 'pot-screen');
        // document.getElementById("display").appendChild(div);
        submitWinners();
    } else {
        var myobj = document.getElementById("pot-screen");
        back.push(myobj);
        myobj.remove();
        codeBlock += '<div><button type="button" onclick="submitWinners()">Results</button></div><table><tr><td></td>';

        for (let p in players) {
            codeBlock += '<td>' + p + '</td>'
        }

        codeBlock += '</tr>';
        for (var i = 0; i < numBoards; i++) {
            codeBlock += "<tr><td> Board " + (i + 1) + '</td>';

            for (var j = 0; j < numPlayers; j++) {
                // codeBlock += `<td><input type="number" class="fpos" value="${pos[i*numBoards+j]}"></td>`
                codeBlock += `<td><input type="number" class="fpos" value=""></td>`
            }

            codeBlock += "</tr>"
        }

        codeBlock += '</table>'

        var div = document.createElement('div');
        div.setAttribute('id', 'boards-screen');
        div.innerHTML = codeBlock;
        document.getElementById("display").appendChild(div);
    }
}

// sets mode for board winner input
function toggleWinnerInput() {
    submitPlayers(true);
}

// callback to submit winners form deletes the form div and loads the next page
function submitWinners() {
    winners = [];
    if (!manualInput) {
        console.log('here')
        boards.forEach(b => {
            var toAdd = {};
            var bestHands = {};
            player_list.forEach(p => {
                bestHands[p] = bestHand(hands[p], b);
                // console.log(`${p} has ${bestHands[p]} - ${names[handStrength(bestHands[p])]}`);
                toAdd[p] = numPlayers;
            });

            // console.log('Best Hands ')
            // console.log(bestHands)
            // console.log('toAdd ')
            // console.log(toAdd)

            /**
             * Proof that this works:
             *  
             *  RTP: 
             *      1. A beats B if and only if A beats more players than B
             *      2. A ties with B if and only if A beats the same amount 
             *         of players as B
             *      
             *      (transitivity - if A beats B and B beats C then A beats C)
             * 
             *  1.  If A beats B then due to transitivity A beats more 
             *      players than B - A beats all players that B beats plus B.
             * 
             *      If A has beats more players than B then for B to beat A, they
             *      must beat everyone A beats plus A, but this is a contradiction
             *      so A beats B.
             * 
             *  2.  If A and B are tied, then due to transitivity if A beat anyone 
             *      who is beating B then they wouldn't be tied as A would then be 
             *      beating B, so A can only be beating players being beaten by B. 
             *      Similarly for B. Hence there's a bijection between the number 
             *      of players they beat so it must be the same number.
             * 
             *      If A and B have beat the same number of players then if A beat 
             *      B then A would be beating more players than B - at least everyone 
             *      that B beats plus B. Hence they must be tied.
             */
            player_list.flatMap(
                (v, i) => player_list.slice(i + 1).forEach(w => {
                    const i = compareHands(bestHands[v], bestHands[w]);
                    if (i >= 0) toAdd[v] -= 1;
                    if (i <= 0) toAdd[w] -= 1;
                })
            );
            winners.push(toAdd);
        });
        console.log(winners);
        var myobj = document.getElementById("pot-screen");
        back.push(myobj);
        myobj.remove();

    } else {
        console.log('there')
        for (var i = 0; i < numBoards; i++) winners.push({});
        var inputs = document.getElementsByClassName("fpos");

        for (var i = 0; i < inputs.length; i++) {
            var p = player_list[i % numPlayers];
            var input = inputs[i].value;
            if (input == '') input = numPlayers + 1;
            winners[Math.floor(i / numPlayers)][p] = inputs[i].value;
        }
        var myobj = document.getElementById("boards-screen");
        back.push(myobj);
        myobj.remove();

    }

    var results = calculateAllIn();

    // create output table
    var codeBlock = '<table style="font-weight: bold"><tr><td></td>'

    player_list.forEach(p => {
        codeBlock += '<td>' + p + '</td>'
    })
    codeBlock += '</tr><tr><td >Net Gain</td>';

    player_list.forEach(p => {
        codeBlock += '<td>';
        if (results[0][p] > 0) {
            codeBlock += '<p style="color: green"> +';
        } else {
            codeBlock += '<p style="color: red">';
        }
        codeBlock += results[0][p] + '</p></td>'
    })
    codeBlock += '</tr></table>';

    codeBlock += '<div style="color:white">' + results[1] + '</div>';

    var div = document.createElement('div');
    div.setAttribute('id', 'output-screen');
    div.innerHTML = codeBlock;
    document.getElementById("display").appendChild(div);
}

// callback function that calculates winnings and updates the player 
// money, and the breakdown of each pot.
function calculateAllIn() {
    const players_unmuted = {...players };
    var players_copy = {...players };
    var summary = '<h1>Breakdown</h1>';
    summary += '<p>(note: values are rounded)</p>';
    var first = true;
    var sidepot_copy = {...sidepot };
    for (var i = 0; i < Object.keys(players_copy).length; i++) {
        if (Object.keys(players_copy).length == 0) break;

        var players_left = Object.keys(players_copy).filter(key => players_copy[key] > 0);

        var mini = Math.min(...players_left.map(x => players_copy[x]));
        players_left.forEach(element => {
            players_copy[element] -= mini;
        });

        P = players_left.toString();

        sidepot_copy[P] = mini * players_left.length;
        if (first) {
            sidepot_copy[P] += pot;
            first = false;
        }
    }

    var sidepot_count = 1;

    for (const [key, value] of Object.entries(sidepot_copy)) {

        var pot_participants = key.split(',');
        var pot_value = value;
        var board_count = 1;
        var summary_temp = ''
        summary_temp += `<h2> Side-pot ${sidepot_count}<br>&emsp;` + key.replaceAll(',', ', ');

        if (first) {
            summary_temp += `  (${value + pot})</h2>`
        } else {
            summary_temp += `  (${value})</h2>`
        }

        sidepot_count++;
        console.log(winners);
        winners.forEach((b, index) => {
                summary_temp += `<h3>Board ${board_count}</h3>`;
                board_count++;
                var max_rank = Math.min(...pot_participants.map(x => b[x]));
                console.log(b);
                var numWinners = pot_participants.filter(p => b[p] == max_rank).length;

                var split = pot_value / (winners.length * numWinners);

                pot_participants.forEach(p => {
                    if (b[p] == max_rank) {
                        players_copy[p] += split;
                        summary_temp += `<p>${p} wins ${Math.round(split)}`;
                        if (!manualInput) {
                            var bh = bestHand(hands[p], boards[index]);
                            console.log(boards[index])
                            console.log(hands[p])
                            console.log(hands[p].length)
                            console.log('best hand ' + bh)
                            console.log('output ' + toOutputFormat(bh))
                            summary_temp += ` with ${names[handStrength(bh)]}`;
                            summary_temp += ' (' + toOutputFormat(bh) + ')';
                        }
                        summary_temp += '</p>';
                    }
                });
                // summary_temp += '</ul>'
            })
            // const remainder = pot_value - 
        if (pot_participants.length != 1) summary += summary_temp;
    }
    var out = {};
    for (const key of player_list) {
        out[key] = Math.round(players_copy[key] - players_unmuted[key]);
    }
    return [out, summary];
}

function selectSuit(arg) {
    // var arg = e.target;
    // console.log("hhh")
    var input = arg.innerHTML;
    // console.log("here")
    // var inputElement = $(arg).closest(".player-input").find(".fcardinput")
    var inputElement = $('.fcardinput');
    var prop = inputElement.val() + input;
    if (prop.length % 2 == 0) {

        if (!validateString(prop)) return;
    } else {

        if (!strt.hasOwnProperty(input)) return;
    }
    inputElement.val(inputElement.val() + input);
}
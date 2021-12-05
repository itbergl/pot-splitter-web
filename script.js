var numPlayers = 0;
var numBoards = 1;
var players = {};
var player_list = [];
var pot = 0;
var sidepot = {};
var winners = [];
var hands = {};
var boards = [];
var manualInput = false;

function addPlayer() {
    var div = document.createElement('div');
    div.setAttribute('class', 'player-input');
    div.innerHTML = document.getElementsByClassName('player-input')[0].innerHTML;
    document.getElementById("players").appendChild(div);
}

function addBoard() {
    numBoards++; //FIX - ensure empty boards are not counted by the end
    var div = document.createElement('div');
    div.setAttribute('class', 'player-input');
    div.innerHTML = `Board ${numBoards} ` + '<input type="text" id="fboard" name="fboard">';
    document.getElementById("pot-screen").appendChild(div);
}

function submitPlayers() {
    var inputs = document.querySelector('#players').querySelectorAll(".player-input");
    Array.prototype.forEach.call(inputs, element => {
        var name = element.querySelector("#fname").value;
        var chips = element.querySelector("#fchips").value;
        var hand = element.querySelector("#fhand").value;
        if (name == "" || chips == "") return;
        numPlayers++;
        player_list.push(name);
        players[name] = parseInt(chips);
        hands[name] = handFormat(hand);
    });;

    // console.log('Players: ' + players);
    // console.log(hands);

    var myobj = document.getElementById("player-screen");
    myobj.remove();



    var codeBlock =
        '<button type="button" onclick="submitPot()">Next</button>';

    if (!manualInput) codeBlock += '<button type="button" onclick="addBoard()" style="margin-left:20px">+</button>';

    codeBlock +=
        '<div class="player-input">' +
        'Pot Size: <input type="number" id="fpot" name="fpot" value=""><br><br>' +
        '</div><div class="player-input">';

    if (manualInput) codeBlock += 'Number of Boards: <input type="number" id="fnumboard" value=""></div>';
    else codeBlock += `Board ${numBoards} ` + '<input type="text" id="fboard" value=""></div>';

    var div = document.createElement('div');
    div.setAttribute('id', 'pot-screen');
    div.innerHTML = codeBlock;
    document.getElementById("display").appendChild(div);
}

function submitPot() {

    if (manualInput) numBoards = parseInt(document.getElementById('fnumboard').value);

    pot = parseInt(document.getElementById('fpot').value);

    document.querySelectorAll('#fboard').forEach(input => {
        boards.push(handFormat(input.value));
    });
    // console.log(boards);
    var myobj = document.getElementById("pot-screen");
    myobj.remove();
    var codeBlock = '';

    if (!manualInput) {
        var div = document.createElement('div');
        div.setAttribute('id', 'boards-screen');
        document.getElementById("display").appendChild(div);
        submitWinners();
    } else {
        codeBlock += '<div><button type="button" onclick="submitWinners()">Calculate Winners</button></div><table><tr><td></td>';

        for (let p in players) {
            codeBlock += '<td>' + p + '</td>'
        }

        codeBlock += '</tr>';
        var pos = [1, 2, 3, 2, 1, 1, 2, 1, 3];
        for (var i = 0; i < numBoards; i++) {
            codeBlock += "<tr><td> Board " + (i + 1) + '</td>';

            for (var j = 0; j < numPlayers; j++) {
                // codeBlock += `<td><input type="number" class="fpos" value="${pos[i*numBoards+j]}"></td>`
                codeBlock += `<td><input type="number" class="fpos" value=""></td>`
            }

            codeBlock += "</tr>"
        }

        codeBlock += '</table>'
    }

    var div = document.createElement('div');
    div.setAttribute('id', 'boards-screen');
    div.innerHTML = codeBlock;
    document.getElementById("display").appendChild(div);
}

function toggleWinnerInput() {
    manualInput = true;
    submitPlayers();
}

function submitWinners() {
    if (!manualInput) {
        boards.forEach(b => {
            var toAdd = {};
            var bestHands = {};
            player_list.forEach(p => {
                bestHands[p] = bestHand(hands[p], b);
                console.log(`${p} has ${bestHands[p]} - ${names[handStrength(bestHands[p])]}`);
                toAdd[p] = numPlayers;
            });

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
            // TODO halve search space by not double counting
            for (const [a, a_hand] of Object.entries(bestHands)) {
                for (const [b, b_hand] of Object.entries(bestHands)) {
                    const comp = compareHands(a_hand, b_hand);
                    if (comp > 0) toAdd[a] -= 1;
                };
            };
            winners.push(toAdd);
        });

        console.log(winners);

    } else {
        for (var i = 0; i < numBoards; i++) winners.push({});
        var inputs = document.getElementsByClassName("fpos");

        for (var i = 0; i < inputs.length; i++) {
            var p = player_list[i % numPlayers];
            var input = inputs[i].value;
            if (input == '') input = numPlayers + 1;
            winners[Math.floor(i / numPlayers)][p] = inputs[i].value;
        }

    }

    var myobj = document.getElementById("boards-screen");
    myobj.remove();

    var results = calculateAllIn();


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

function calculateAllIn() {
    var players_copy = {...players };
    var summary = '<h1>Breakdown</h1>';
    var first = true;

    for (var i = 0; i < Object.keys(players).length; i++) {
        if (Object.keys(players).length == 0) break;

        var players_left = Object.keys(players).filter(key => players[key] > 0);

        var mini = Math.min(...players_left.map(x => players[x]));
        players_left.forEach(element => {
            players[element] -= mini;
        });

        P = players_left.toString();

        sidepot[P] = mini * players_left.length;
        if (first) {
            sidepot[P] += pot;
            first = false;
        }
    }
    var sidepot_count = 1;

    for (const [key, value] of Object.entries(sidepot)) {

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

        winners.forEach((b, index) => {
            summary_temp += `<h3>Board ${board_count}</h3><ul>`;
            board_count++;
            var max_rank = Math.min(...pot_participants.map(x => b[x]));
            console.log(b);
            var count = pot_participants.filter(p => b[p] == max_rank).length;

            var split = pot_value / (winners.length * count);

            pot_participants.forEach(p => {
                if (b[p] == max_rank) {
                    players[p] += split;
                    summary_temp += `<li>${p} wins ${Math.round(split)}`;
                    if (!manualInput) {
                        var bh = bestHand(boards[index], hands[p]);
                        summary_temp += ` with ${names[handStrength(bh)]}`;
                        summary_temp += ' (' + bh + ')';
                    }
                    summary_temp += '</li>';
                }
            });
            summary_temp += '</ul>'
        })

        if (pot_participants.length != 1) summary += summary_temp;
    }
    var out = {};
    for (const key of player_list) {
        out[key] = Math.round(players[key] - players_copy[key]);
    }
    return [out, summary];
}
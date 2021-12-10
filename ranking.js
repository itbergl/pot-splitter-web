// const converter = require('unicode-playing-card-converter');

// assigns value to each hand rank
const strt = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
const suits = { '♠': 's', '♣': 'c', '♥': 'h', '♦': 'd' };
// console.log(suits)
// derived values of all hands
const names = {
    0: 'High Card',
    3: 'One Pair',
    6: 'Two Pair',
    7: 'Three of a Kind',
    8: 'Straight',
    9: 'Flush',
    10: 'Full House',
    11: 'Four of a Kind',
    17: 'Straight Flush',
    18: 'Royal Flush'
}

// returns a dictionary with the number of each value
function countPairs(hand) {
    var out = {};

    hand.forEach((card) => {
        out[card[0]] = (out[card[0]] || 0) + 1;
    });
    return out;
}

// 

// true if hand is a flush
function detFlush(hand) {
    var fl = hand[0][1];
    for (var i = 0; i < hand.length; i++) {
        if (hand[i][1] != fl) return false;
    }
    return true;
}

// true if hand is a straight
// TODO change input to be hand not a dic
function detStraight(dic) {
    var dynStrt = {...strt };

    if (Object.keys(dic).length < 5) return false;

    if (dic.hasOwnProperty('2')) dynStrt['A'] = 1;

    const maxBy = (comparator, array) =>
        array.reduce((acc, val) => comparator(acc, val) > 0 ? acc : val);
    const minBy = (comparator, array) =>
        array.reduce((acc, val) => comparator(acc, val) < 0 ? acc : val);
    const orderComp = (a, b) => dynStrt[a] - dynStrt[b];

    const max = dynStrt[maxBy(orderComp, Object.keys(dic))];
    const min = dynStrt[minBy(orderComp, Object.keys(dic))];
    // console.log(`found max=${max} min=${min}`);

    return (max - min == 4);
}

// returns the derived strength of each hand
function handStrength(A) {
    var dic = countPairs(A);
    var out = 0;
    for (const [_, value] of Object.entries(dic)) {
        switch (value) {
            case 1:
                out += 0;
                break;
            case 2:
                out += 3;
                break;
            case 3:
                out += 7;
                break;
            case 4:
                out += 11;
                break;
        }
    }
    if (detStraight(dic)) out += 8;
    if (detFlush(A)) out += 9;

    if (out == 17) {
        if (dic.hasOwnProperty('K') && dic.hasOwnProperty('A')) out += 1;
    }
    return out;
}

// console.log(handStrength(handFormat('Ah2h3h4h5h')))

// comparitor function for hands - only called
// for hands that have the same rank. 
// returns +1 if A > B, 0 if A==B, -1 if A < B
function compareHands(A, B) {
    const strengthA = handStrength(A);
    const strengthB = handStrength(B);
    // console.log(`${A} (${names[strengthA]})`)
    // console.log(`${B} (${names[strengthB]})`)
    if (strengthA == strengthB) {
        const dicA = countPairs(A);
        const dicB = countPairs(B);
        var dynStrtA = {...strt };
        var dynStrtB = {...strt };
        if (strengthA == 8 || strengthA == 17) {
            if (dicA.hasOwnProperty('2')) dynStrtA['A'] = 1;
            if (dicB.hasOwnProperty('2')) dynStrtB['A'] = 1;
        }
        var compareA = (el1, el2) => {
            return dicA[el2] - dicA[el1];
        }
        var compareB = (el1, el2) => {
            return dicB[el2] - dicB[el1];
        }

        var valsA = Object.keys(dicA).sort(compareA);
        var valsB = Object.keys(dicB).sort(compareB);
        // console.log(valsA)
        // console.log(valsB)
        for (var i = 0; i < valsA.length; i++) {
            if (valsA[i] != valsB[i]) {
                return (strt[valsA[i]] > strt[valsB[i]]) ? 1 : -1;
            }
        }
        return 0;
    }
    return (strengthA > strengthB) ? 1 : -1;
}

// finds the best possible hand given hole cards and a board
function bestHand(hand, board) {
    var cards = hand.concat(board);

    var result = cards.flatMap(
        (v, i) => cards.slice(i + 1).map(w => [v, w])
    );

    result = result.map(x => {
        return cards.filter(a => a != x[0] && a != x[1]);
    })

    return sortHand(result.reduce((prev, curr) => {
        return compareHands(prev, curr) > 0 ? prev : curr;
    }));

}
// var a = bestHand(handFormat('TdAd'), handFormat('Ac3c4d5cTs'));

// console.log(a);
// returns a formatted string of a hand

// TODO UNIT TESTING
function toInputFormat(hand, sort = false) {
    if (hand.length == 0) return hand;
    var ret = hand.match(/.{1,2}/g);
    // console.log(ret)
    // validate input and ensure capitalisation
    for (var i = 0; i < ret.length; i++) {
        const rank = ret[i].charAt(0).toUpperCase();
        const suit = suits[ret[i].charAt(1).toLowerCase()] || ret[i].charAt(1).toLowerCase();
        // console.log(rank)
        // console.log(ret[i])
        // if (!(strt.hasOwnProperty(rank)) || !(suits.hasOwnProperty(suit))) return undefined;
        // console.log(1)
        ret[i] = rank + suit;
    }
    return sort ? sortHand(ret) : ret;
}

// TODO UNIT TESTING
function toOutputFormat(hand) {
    if (hand.length == 0) return undefined;
    var ret = hand.map(c => {
        return Object.keys(suits).find(key => suits[key] === c) || c;
    });

    // // validate input and ensure capitalisation
    // for (var i = 0; i < ret.length; i++) {
    //     const rank = ret[i].charAt(0);
    //     const suit = ret[i].charAt(1);
    //     // console.log(rank)
    //     // console.log(ret[i])
    //     if (!(strt.hasOwnProperty(rank)) || !(suits.hasOwnProperty(suit))) return undefined;
    //     // console.log(1)
    //     ret[i] = rank + suit;
    // }


    return ret.join(', ');
}

function validateHand(hand) {
    // console.log(hand)
    //every even is a rank
    var ret = true;
    hand.forEach(c => {
        const rank = c[0];
        const suit = Object.keys(suits).find(key => suits[key] == c[1]);
        if (!strt.hasOwnProperty(rank) || (typeof suit === 'undefined')) {
            ret = false;
            return false;
        }
    })
    return ret;
    //every odd is a suit

}
// var a = toOutputFormat(toInputFormat("2dAc3h"))
// console.log(a)

function validateString(hand) {
    return validateHand(toInputFormat(hand));
}

function sortHand(ret) {
    // sort cards
    var myStrt = {...strt };
    var dic = countPairs(ret);

    // TODO just check the value of the hand idiot
    if (detStraight(dic) && dic.hasOwnProperty('2')) {
        myStrt['A'] = 1;
    }
    ret.sort((el1, el2) => {
        return myStrt[el2[0]] - myStrt[el1[0]];
    })

    return ret;
}

function printable(hand) {
    var ret = '';
    // console.log(hand)
    for (var i = 0; i < hand.length; i++) {
        ret += hand[i][0] + suits[hand[i][1]];
        ret += ' ';
    }
    return ret;
}

var bestHands = {
    "Isaac": toInputFormat("AhAdAsAcKd"),
    "Jake": toInputFormat("2h3d4s5c7s"),
    "Jake's Mum": toInputFormat("2h3h4h5h6h")
};


// var toAdd = { "Isaac": 3, "Jake": 3, "Jake's Mum": 3 };
// // get all combinations of hands against each other
// var res = Object.keys(bestHands).flatMap(
//     (v, i) => Object.keys(bestHands).slice(i + 1).forEach(w => {
//         const i = compareHands(bestHands[v], bestHands[w]);
//         if (i >= 0) toAdd[v] -= 1;
//         if (i <= 0) toAdd[w] -= 1;
//     })
// );

// console.log(toAdd);
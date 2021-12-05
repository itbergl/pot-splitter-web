const fact = [1, 1, 2, 6, 24];
const strt = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

const names = {
    0: 'High Card',
    3: 'One Pair',
    6: 'Two Pair',
    9: 'Three of a Kind',
    10: 'Straight',
    11: 'Flush',
    12: 'Full House',
    18: 'Four of a Kind',
    21: 'Straight Flush'
}

function countPairs(hand) {
    var out = {};

    for (var i = 0; i < 5; i++) {
        if (hand[2 * i] in out) out[hand[2 * i]] += 1;
        else out[hand[2 * i]] = 1;
    }

    return out;
}

function detFlush(hand) {
    var fl = hand[1];
    for (var i = 0; i < 5; i++) {
        if (hand[2 * i + 1] != fl) return false;
    }
    return true;
}

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

function handStrength(A) {
    var dic = countPairs(A);
    var out = 0;
    for (const [_, value] of Object.entries(dic)) {
        if (value < 2) continue;
        out += fact[value] / fact[value - 2];
    }
    out *= 1.5;
    if (detStraight(dic)) out += 10;
    if (detFlush(A)) out += 11;

    return out;
}

// var A = 'AsAc4h4s5h';
// var B = '2c3c5cQc9c';


function compareHands(A, B) {
    const strengthA = handStrength(A);
    const strengthB = handStrength(B);
    // console.log(`${A} (${names[strengthA]})`)
    // console.log(`${B} (${names[strengthB]})`)
    if (strengthA == strengthB) {
        const dicA = countPairs(A);
        const dicB = countPairs(B);
        var dynStrt = {...strt };
        if (strengthA == 10 || strengthA == 21) {
            if (dicA.hasOwnProperty('2')) dynStrt['A'] = 1;
        }
        var compareFn = (el1, el2) => {
            return dynStrt[el2] - dynStrt[el1];
        }
        var valsA = Object.keys(dicA).sort(compareFn);
        var valsB = Object.keys(dicB).sort(compareFn);

        for (var i = 0; i < valsA.length; i++) {
            if (valsA[i] != valsB[i]) {
                if (strt[valsA[i]] > strt[valsB[i]]) return 1;
                return -1;
            }
        }
        return 0;
    }
    if (strengthA > strengthB) return 1;
    return -1;
}

function bestHand(hand, board) {
    var wholeHand = hand + board;
    var split = wholeHand.match(/.{1,2}/g);

    var result = split.flatMap(
        (v, i) => split.slice(i + 1).map(w => (v + ',' + w).split(','))
    );

    result = result.map(x => {
            return split.filter(a => !x.includes(a)).join('');
        })
        // console.log(result);
    return result.reduce((prev, curr) => {
        return compareHands(prev, curr) > 0 ? prev : curr;
    });

}

function handFormat(hand) {
    var ret = "";
    for (var i = 0; i < hand.length; i++) {
        ret += i % 2 == 0 ? hand.charAt(i).toUpperCase() : hand.charAt(i).toLowerCase();
    }
    return ret;
}
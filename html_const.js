function makeButtons() {
    return `
    <div class="card-input" style="font-weight: bold;font-size:0px; padding:0px">
    <button class="rank-symbol " onclick="selectSuit(this, false) ">A</button>
    <button class="rank-symbol " onclick="selectSuit(this, false) ">K</button>
    <button class="rank-symbol " onclick="selectSuit(this, false) ">Q</button>
    <button class="rank-symbol " onclick="selectSuit(this, false) ">J</button>
    <button class="rank-symbol " onclick="selectSuit(this, false) ">T</button>
    <button class="rank-symbol " onclick="selectSuit(this, false) ">9</button>
    <button class="rank-symbol " onclick="selectSuit(this, false) ">8</button>
    <button class="rank-symbol " onclick="selectSuit(this, false) ">7</button>
    <button class="rank-symbol " onclick="selectSuit(this, false) ">6</button>
    <button class="rank-symbol " onclick="selectSuit(this, false) ">5</button>
    <button class="rank-symbol " onclick="selectSuit(this, false) ">4</button>
    <button class="rank-symbol " onclick="selectSuit(this, false) ">3</button>
    <button class="rank-symbol " onclick="selectSuit(this, false) ">2</button>
</div>
<div class="card-input ">
    <button class="suit-symbol " onclick="selectSuit(this, false) ">&spades;</button>
    <button class="suit-symbol " style="color:red " onclick="selectSuit(this, false) ">&hearts;</button>
    <button class="suit-symbol " onclick="selectSuit(this, false) ">&clubs;</button>
    <button class="suit-symbol " style="color:red " onclick="selectSuit(this, false) ">&diams;</button>
</div>`;
}
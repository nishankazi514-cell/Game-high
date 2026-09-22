const socket = io();

const findBtn = document.getElementById("findBtn");
const againBtn = document.getElementById("againBtn");

const statusEl = document.getElementById("status");
const arena = document.getElementById("arena");

const countdown = document.getElementById("countdown");
const result = document.getElementById("result");

const yourCard = document.getElementById("yourCard");
const oppCard = document.getElementById("oppCard");

const scoreEl = document.getElementById("score");
const winsEl = document.getElementById("wins");
const roundEl = document.getElementById("round");


let score = 0;
let wins = 0;
let round = 0;


/* =========================
   RESET CARDS
========================= */

function resetCards() {

    yourCard.className =
        "playing-card back";

    yourCard.textContent = "?";


    oppCard.className =
        "playing-card back";

    oppCard.textContent = "?";
}


/* =========================
   SHOW CARD
========================= */

function showCard(el, card) {

    el.className =
        "playing-card" +
        (card.color === "red" ? " red" : "");


    el.innerHTML =
        `<div>${card.rank}</div>` +
        `<div>${card.suit}</div>`;
}


/* =========================
   FIND MATCH
========================= */

function findMatch() {

    findBtn.disabled = true;

    statusEl.textContent =
        "Searching for an opponent...";


    socket.emit("find_match");
}


/* =========================
   FIND BUTTON
========================= */

findBtn.addEventListener(
    "click",
    findMatch
);


/* =========================
   PLAY AGAIN
========================= */

againBtn.addEventListener(
    "click",
    () => {

        result.textContent = "";

        countdown.textContent = "";

        resetCards();

        findBtn.disabled = false;

        findMatch();
    }
);


/* =========================
   SOCKET CONNECTED
========================= */

socket.on(
    "connected",
    () => {

        statusEl.textContent =
            "Connected";
    }
);


/* =========================
   MATCHMAKING
========================= */

socket.on(
    "matchmaking",
    data => {

        statusEl.textContent =
            data.message;
    }
);


/* =========================
   MATCH FOUND
========================= */

socket.on(
    "match_found",
    data => {

        arena.classList.remove("hidden");


        statusEl.textContent =
            `Opponent found • Player ${data.player_number}`;


        round += 1;


        roundEl.textContent =
            `ROUND ${round}`;


        result.textContent = "";


        resetCards();
    }
);
/* =========================
   ROUND START
========================= */

socket.on(
    "round_start",
    data => {

        let n = data.countdown;

        countdown.textContent = n;


        const timer = setInterval(
            () => {

                n -= 1;


                if (n > 0) {

                    countdown.textContent = n;

                } else {

                    clearInterval(timer);

                    countdown.textContent =
                        "DUEL!";
                }

            },
            1000
        );
    }
);


/* =========================
   REVEAL YOUR CARD
========================= */

socket.on(
    "reveal_card",
    data => {

        showCard(
            yourCard,
            data.card
        );
    }
);


/* =========================
   ROUND RESULT
========================= */

socket.on(
    "round_result",
    data => {

        showCard(
            yourCard,
            data.your_card
        );


        showCard(
            oppCard,
            data.opponent_card
        );


        countdown.textContent = "";


        if (data.result === "win") {

            wins += 1;

            score += 100;

            result.textContent =
                "YOU WIN";


        } else if (data.result === "loss") {

            result.textContent =
                "YOU LOSE";


        } else {

            score += 25;

            result.textContent =
                "DRAW";
        }


        scoreEl.textContent =
            score;

        winsEl.textContent =
            wins;
    }
);
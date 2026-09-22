const socket = io();

const homeScreen = document.getElementById("homeScreen");
const arena = document.getElementById("arena");

const findBtn = document.getElementById("findBtn");
const againBtn = document.getElementById("againBtn");

const statusEl = document.getElementById("status");
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

let audioContext = null;


/* =========================
   SOUND SYSTEM
========================= */

function initSound() {
    if (!audioContext) {
        audioContext = new (
            window.AudioContext ||
            window.webkitAudioContext
        )();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}


function beep(
    frequency = 500,
    duration = 0.12,
    type = "sine",
    volume = 0.06
) {
    if (!audioContext) return;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(
        volume,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + duration
    );
}


function soundClick() {
    beep(650, 0.08, "sine", 0.05);
}


function soundCountdown() {
    beep(420, 0.12, "square", 0.045);
}


function soundReveal() {
    beep(720, 0.10, "triangle", 0.06);

    setTimeout(() => {
        beep(980, 0.12, "triangle", 0.05);
    }, 80);
}


function soundWin() {
    beep(660, 0.12, "sine", 0.07);

    setTimeout(() => {
        beep(880, 0.14, "sine", 0.07);
    }, 130);

    setTimeout(() => {
        beep(1100, 0.20, "sine", 0.06);
    }, 270);
}


function soundLose() {
    beep(320, 0.16, "sawtooth", 0.045);

    setTimeout(() => {
        beep(220, 0.25, "sawtooth", 0.035);
    }, 150);
}


function soundDraw() {
    beep(500, 0.14, "triangle", 0.05);

    setTimeout(() => {
        beep(500, 0.14, "triangle", 0.04);
    }, 170);
}


/* =========================
   CARD FUNCTIONS
========================= */

function resetCards() {

    yourCard.className =
        "playing-card back";

    yourCard.textContent = "?";

    oppCard.className =
        "playing-card back";

    oppCard.textContent = "?";
}


function showCard(element, card) {

    element.className =
        "playing-card";

    if (card.color === "red") {
        element.classList.add("red");
    }

    element.innerHTML =
        `<div class="card-rank">${card.rank}</div>` +
        `<div class="card-suit">${card.suit}</div>`;

    element.classList.add("card-reveal");

    setTimeout(() => {
        element.classList.remove("card-reveal");
    }, 500);
}


/* =========================
   MATCHMAKING
========================= */

function findMatch() {

    initSound();
    soundClick();

    findBtn.disabled = true;

    statusEl.textContent =
        "🔎 Searching for opponent...";

    result.textContent = "";

    countdown.textContent = "";

    resetCards();

    socket.emit("find_match");
}


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

        initSound();
        soundClick();

        result.textContent = "";

        countdown.textContent = "";

        resetCards();

        findBtn.disabled = false;

        findMatch();
    }
);


/* =========================
   SOCKET CONNECTION
========================= */

socket.on(
    "connect",
    () => {

        statusEl.textContent =
            "🟢 Connected • Ready to play";
    }
);


socket.on(
    "disconnect",
    () => {

        statusEl.textContent =
            "🔴 Connection lost...";
    }
);


socket.on(
    "connected",
    () => {

        statusEl.textContent =
            "🟢 Connected • Ready to play";
    }
);


/* =========================
   WAITING
========================= */

socket.on(
    "matchmaking",
    data => {

        statusEl.textContent =
            "🔎 " + data.message;

        findBtn.disabled = true;
    }
);


/* =========================
   MATCH FOUND
========================= */

socket.on(
    "match_found",
    data => {

        initSound();
        soundClick();

        homeScreen.classList.add(
            "hidden"
        );

        arena.classList.remove(
            "hidden"
        );

        statusEl.textContent =
            "⚔️ Opponent found! Get ready...";

        round += 1;

        roundEl.textContent =
            "ROUND " + round;

        result.textContent = "";

        countdown.textContent = "";

        resetCards();
    }
);


/* =========================
   COUNTDOWN
========================= */

socket.on(
    "round_start",
    data => {

        initSound();

        let n = data.countdown;

        countdown.textContent =
            n;

        soundCountdown();

        const timer =
            setInterval(() => {

                n -= 1;

                if (n > 0) {

                    countdown.textContent =
                        n;

                    soundCountdown();

                } else {

                    clearInterval(timer);

                    countdown.textContent =
                        "DUEL!";

                    beep(
                        900,
                        0.18,
                        "square",
                        0.06
                    );
                }

            }, 1000);
    }
);
/* =========================
   CARD REVEAL
========================= */

socket.on(
    "reveal_card",
    data => {

        initSound();

        showCard(
            yourCard,
            data.card
        );

        soundReveal();

        statusEl.textContent =
            "🃏 Your card is revealed!";
    }
);


/* =========================
   ROUND RESULT
========================= */

socket.on(
    "round_result",
    data => {

        initSound();

        showCard(
            yourCard,
            data.your_card
        );

        setTimeout(() => {

            showCard(
                oppCard,
                data.opponent_card
            );

        }, 180);


        countdown.textContent = "";


        if (data.result === "win") {

            wins += 1;

            score += 100;

            result.textContent =
                "🏆 YOU WIN!";

            result.className =
                "result win";

            statusEl.textContent =
                "🎉 Great! You won this round.";

            soundWin();

        }

        else if (data.result === "loss") {

            result.textContent =
                "DEFEAT";

            result.className =
                "result loss";

            statusEl.textContent =
                "Opponent won this round.";

            soundLose();

        }

        else {

            score += 25;

            result.textContent =
                "DRAW";

            result.className =
                "result draw";

            statusEl.textContent =
                "🤝 Same card value — Draw.";

            soundDraw();
        }


        scoreEl.textContent =
            score;

        winsEl.textContent =
            wins;


        againBtn.disabled = false;

        againBtn.textContent =
            "⚔️ PLAY ANOTHER ROUND";
    }
);


/* =========================
   FIRST USER TOUCH
   UNLOCK MOBILE SOUND
========================= */

document.addEventListener(
    "touchstart",
    () => {
        initSound();
    },
    {
        once: true
    }
);


document.addEventListener(
    "click",
    () => {
        initSound();
    },
    {
        once: true
    }
);

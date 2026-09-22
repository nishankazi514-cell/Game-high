/* =========================================
   HIGH CARD DUEL
   MAIN JAVASCRIPT
   PART 1 / 4
========================================= */


/* ================= SOCKET ================= */

const socket = io();


/* ================= SCREENS ================= */

const homeScreen =
    document.getElementById("homeScreen");

const searchScreen =
    document.getElementById("searchScreen");

const arenaScreen =
    document.getElementById("arenaScreen");


/* ================= BUTTONS ================= */

const findBtn =
    document.getElementById("findBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const playAgainBtn =
    document.getElementById("playAgainBtn");

const leaveBtn =
    document.getElementById("leaveBtn");


/* ================= STATUS ================= */

const homeStatus =
    document.getElementById("homeStatus");

const searchStatus =
    document.getElementById("searchStatus");

const arenaStatus =
    document.getElementById("arenaStatus");


/* ================= GAME ELEMENTS ================= */

const yourCard =
    document.getElementById("yourCard");

const opponentCard =
    document.getElementById("opponentCard");

const countdown =
    document.getElementById("countdown");

const resultBox =
    document.getElementById("resultBox");

const resultIcon =
    document.getElementById("resultIcon");

const resultTitle =
    document.getElementById("resultTitle");

const resultText =
    document.getElementById("resultText");

const pointsEarned =
    document.getElementById("pointsEarned");

const score =
    document.getElementById("score");

const wins =
    document.getElementById("wins");

const roundLabel =
    document.getElementById("roundLabel");

const roundNumber =
    document.getElementById("roundNumber");

const gameState =
    document.getElementById("gameState");


/* ================= GAME STATE ================= */

let totalPoints = 0;

let totalWins = 0;

let currentRound = 0;

let playerNumber = 0;

let connected = false;

let searching = false;

let duelActive = false;

let countdownTimer = null;


/* ================= AUDIO ================= */

let audioContext = null;


/*
   Browser sound starts only after
   the player interacts with the page.
*/

function initSound() {

    if (!audioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        audioContext =
            new AudioContext();
    }

    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();
    }
}


/* ================= BASIC SOUND ================= */

function playTone(
    frequency,
    duration,
    type = "sine",
    volume = 0.05
) {

    if (!audioContext) {
        return;
    }

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
        frequency,
        audioContext.currentTime
    );


    gain.gain.setValueAtTime(
        volume,
        audioContext.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime +
        duration
    );


    oscillator.connect(gain);

    gain.connect(
        audioContext.destination
    );


    oscillator.start();


    oscillator.stop(
        audioContext.currentTime +
        duration
    );
}


/* ================= CLICK SOUND ================= */

function soundClick() {

    playTone(
        650,
        0.08,
        "sine",
        0.045
    );
}


/* ================= SEARCH SOUND ================= */

function soundSearch() {

    playTone(
        430,
        0.10,
        "triangle",
        0.04
    );

    setTimeout(() => {

        playTone(
            620,
            0.10,
            "triangle",
            0.035
        );

    }, 120);
}


/* ================= COUNTDOWN SOUND ================= */

function soundCountdown() {

    playTone(
        520,
        0.12,
        "square",
        0.035
    );
}


/* ================= DUEL SOUND ================= */

function soundDuel() {

    playTone(
        700,
        0.10,
        "square",
        0.045
    );

    setTimeout(() => {

        playTone(
            950,
            0.16,
            "square",
            0.045
        );

    }, 100);
}


/* ================= CARD SOUND ================= */

function soundCard() {

    playTone(
        760,
        0.09,
        "triangle",
        0.05
    );

    setTimeout(() => {

        playTone(
            1050,
            0.12,
            "triangle",
            0.045
        );

    }, 100);
}


/* ================= WIN SOUND ================= */

function soundWin() {

    playTone(
        660,
        0.12,
        "sine",
        0.06
    );

    setTimeout(() => {

        playTone(
            830,
            0.12,
            "sine",
            0.06
        );

    }, 130);

    setTimeout(() => {

        playTone(
            1100,
            0.20,
            "sine",
            0.055
        );

    }, 260);
}


/* ================= LOSE SOUND ================= */

function soundLose() {

    playTone(
        350,
        0.16,
        "sawtooth",
        0.035
    );

    setTimeout(() => {

        playTone(
            230,
            0.22,
            "sawtooth",
            0.03
        );

    }, 160);
}


/* ================= DRAW SOUND ================= */

function soundDraw() {

    playTone(
        520,
        0.13,
        "triangle",
        0.04
    );

    setTimeout(() => {

        playTone(
            520,
            0.13,
            "triangle",
            0.035
        );

    }, 180);
}


/* ================= SCREEN HELPER ================= */

function showScreen(screen) {

    homeScreen.classList.add("hidden");

    searchScreen.classList.add("hidden");

    arenaScreen.classList.add("hidden");


    screen.classList.remove("hidden");
}


/* ================= STATUS ================= */

function setHomeStatus(message) {

    homeStatus.textContent =
        message;
}


function setSearchStatus(message) {

    searchStatus.textContent =
        message;
}


function setArenaStatus(message) {

    arenaStatus.textContent =
        message;
}


/* ================= RESET CARD ================= */

function resetCards() {

    yourCard.className =
        "playing-card card-back";

    yourCard.innerHTML = `
        <div class="question">?</div>
        <div class="card-label">
            YOUR CARD
        </div>
    `;


    opponentCard.className =
        "playing-card card-back";

    opponentCard.innerHTML = `
        <div class="question">?</div>
        <div class="card-label">
            OPPONENT
        </div>
    `;
}


/* ================= RESET RESULT ================= */

function resetResult() {

    resultBox.className =
        "result-box hidden";

    resultIcon.textContent =
        "🏆";

    resultTitle.textContent =
        "YOU WIN!";

    resultText.textContent =
        "";

    pointsEarned.textContent =
        "+0";
}


/* ================= RESET ROUND ================= */

function resetRoundUI() {

    resetCards();

    resetResult();

    countdown.textContent =
        "READY";

    gameState.textContent =
        "READY";

    playAgainBtn.classList.add(
        "hidden"
    );
}


/* ================= INITIAL STATE ================= */

resetCards();

resetResult();

setHomeStatus(
    "🔄 Connecting to server..."
);
/* =========================================
   SOCKET EVENTS + BUTTONS
   PART 2 / 4
========================================= */


/* ================= CONNECT ================= */

socket.on("connect", () => {

    connected = true;

    setHomeStatus(
        "🟢 Connected to server"
    );

    findBtn.disabled = false;

});


/* ================= CONNECT ERROR ================= */

socket.on("connect_error", () => {

    connected = false;

    findBtn.disabled = true;

    setHomeStatus(
        "🔴 Server connection failed"
    );

});


/* ================= DISCONNECT ================= */

socket.on("disconnect", () => {

    connected = false;

    findBtn.disabled = true;

    if (!duelActive) {

        setHomeStatus(
            "🔴 Disconnected from server"
        );

    }

});


/* ================= FIND OPPONENT ================= */

findBtn.addEventListener(
    "click",
    () => {

        if (!connected) {
            return;
        }

        initSound();

        soundClick();

        searching = true;

        findBtn.disabled = true;

        showScreen(searchScreen);

        setSearchStatus(
            "Searching for opponent..."
        );

        soundSearch();

        socket.emit(
            "find_match"
        );

    }
);


/* ================= CANCEL SEARCH ================= */

cancelBtn.addEventListener(
    "click",
    () => {

        initSound();

        soundClick();

        searching = false;

        socket.emit(
            "leave_match"
        );

        showScreen(homeScreen);

        if (connected) {
            findBtn.disabled = false;
        }

        setHomeStatus(
            "🟢 Ready to find an opponent"
        );

    }
);


/* ================= MATCHMAKING ================= */

socket.on(
    "matchmaking",
    (data) => {

        if (!data) {
            return;
        }

        if (
            data.status ===
            "waiting"
        ) {

            setSearchStatus(
                "🔎 Waiting for another player..."
            );

        }

    }
);


/* ================= PLAYER NAMES ================= */

const playerNames =
    document.querySelectorAll(
        ".player-name"
    );


function updatePlayerNames() {

    if (
        !playerNames ||
        playerNames.length < 2
    ) {
        return;
    }


    if (playerNumber === 1) {

        playerNames[0].textContent =
            "PLAYER 1 • YOU";

        playerNames[1].textContent =
            "PLAYER 2 • OPPONENT";

    } else {

        playerNames[0].textContent =
            "PLAYER 2 • YOU";

        playerNames[1].textContent =
            "PLAYER 1 • OPPONENT";

    }

}


/* ================= MATCH FOUND ================= */

socket.on(
    "match_found",
    (data) => {

        if (!data) {
            return;
        }

        searching = false;

        duelActive = true;

        playerNumber =
            data.player_number || 1;


        currentRound++;

        roundLabel.textContent =
            "ROUND " +
            currentRound;

        roundNumber.textContent =
            currentRound;


        updatePlayerNames();

        resetRoundUI();


        gameState.textContent =
            "MATCHED";

        setArenaStatus(
            "⚔️ Opponent found! Get ready..."
        );


        showScreen(
            arenaScreen
        );


        soundDuel();

    }
);


/* ================= LEAVE DUEL ================= */

leaveBtn.addEventListener(
    "click",
    () => {

        initSound();

        soundClick();

        duelActive = false;

        searching = false;

        socket.emit(
            "leave_match"
        );

        resetRoundUI();

        showScreen(
            homeScreen
        );

        if (connected) {

            findBtn.disabled =
                false;

        }

        setHomeStatus(
            "🟢 Ready to find an opponent"
        );

    }
);


/* ================= PLAY AGAIN ================= */

playAgainBtn.addEventListener(
    "click",
    () => {

        if (!connected) {
            return;
        }

        initSound();

        soundClick();

        playAgainBtn.disabled =
            true;

        playAgainBtn.textContent =
            "⏳ PREPARING NEXT ROUND...";


        /*
          Server cleans the previous
          room after about 5 seconds.
        */

        setTimeout(
            () => {

                if (!connected) {
                    return;
                }

                playAgainBtn.disabled =
                    false;

                playAgainBtn.textContent =
                    "⚔️ PLAY ANOTHER ROUND";


                searching = true;

                duelActive = false;

                showScreen(
                    searchScreen
                );


                setSearchStatus(
                    "🔎 Searching for opponent..."
                );


                soundSearch();


                socket.emit(
                    "find_match"
                );

            },
            5500
        );

    }
);


/* ================= READY STATE ================= */

setHomeStatus(
    "🔄 Connecting to server..."
);

findBtn.disabled = true;
/* =========================================
   ROUND COUNTDOWN + CARD REVEAL
   PART 3 / 4
========================================= */


/* ================= ROUND START ================= */

socket.on(
    "round_start",
    (data) => {

        if (!data) {
            return;
        }

        duelActive = true;

        resetCards();

        resetResult();

        gameState.textContent =
            "COUNTDOWN";

        setArenaStatus(
            "⚔️ Duel starting..."
        );


        let number =
            Number(data.countdown) || 3;


        countdown.textContent =
            number;

        countdown.classList.remove(
            "countdown-big"
        );

        void countdown.offsetWidth;

        countdown.classList.add(
            "countdown-big"
        );

        soundCountdown();


        if (countdownTimer) {

            clearInterval(
                countdownTimer
            );

        }


        countdownTimer =
            setInterval(
                () => {

                    number--;


                    if (number > 0) {

                        countdown.textContent =
                            number;

                        countdown.classList.remove(
                            "countdown-big"
                        );

                        void countdown.offsetWidth;

                        countdown.classList.add(
                            "countdown-big"
                        );

                        soundCountdown();

                        return;

                    }


                    clearInterval(
                        countdownTimer
                    );

                    countdownTimer =
                        null;


                    countdown.textContent =
                        "DUEL!";

                    gameState.textContent =
                        "DUEL";

                    setArenaStatus(
                        "🔥 Reveal your cards!"
                    );

                    soundDuel();


                },
                1000
            );

    }
);


/* ================= CARD HTML ================= */

function createCardHTML(card) {

    if (!card) {

        return `
            <div class="question">?</div>
        `;

    }


    const red =
        card.color === "red"
            ? "red"
            : "";


    return `

        <div class="card-corner">
            ${card.rank}${card.suit}
        </div>

        <div class="card-rank">
            ${card.rank}
        </div>

        <div class="card-suit">
            ${card.suit}
        </div>

        <div class="card-corner bottom">
            ${card.rank}${card.suit}
        </div>

    `;

}


/* ================= SHOW CARD ================= */

function showCard(
    element,
    card
) {

    if (!element || !card) {
        return;
    }


    const red =
        card.color === "red"
            ? "red"
            : "";


    element.className =
        "playing-card card-open " +
        red;


    element.innerHTML =
        createCardHTML(card);


    element.classList.remove(
        "card-flip"
    );

    void element.offsetWidth;

    element.classList.add(
        "card-flip"
    );


    soundCard();

}


/* ================= REVEAL CARD ================= */

socket.on(
    "reveal_card",
    (data) => {

        if (!data || !data.card) {
            return;
        }


        duelActive = true;


        if (countdownTimer) {

            clearInterval(
                countdownTimer
            );

            countdownTimer =
                null;

        }


        countdown.textContent =
            "OPEN";


        gameState.textContent =
            "REVEAL";


        setArenaStatus(
            "🃏 Your card has been revealed!"
        );


        /*
          The server sends each player
          their own card only.
        */

        showCard(
            yourCard,
            data.card
        );


        /*
          Opponent card stays hidden
          until the round result arrives.
        */

        opponentCard.className =
            "playing-card card-back";


        opponentCard.innerHTML = `

            <div class="question">?</div>

            <div class="card-label">
                OPPONENT
            </div>

        `;

    }
);


/* ================= SAFE CARD RESET ================= */

function prepareNextVisualRound() {

    resetCards();

    resetResult();

    countdown.textContent =
        "READY";

    gameState.textContent =
        "READY";

}


/* ================= PAGE VISIBILITY ================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            initSound();

        }

    }
);


/* ================= FIRST TOUCH ================= */

document.addEventListener(
    "pointerdown",
    () => {

        initSound();

    },
    {
        once: true
      
    }
);
/* =========================================
   RESULT + POINTS + FINAL CONTROLS
   PART 4 / 4
========================================= */


/* ================= SHOW OPPONENT CARD ================= */

function showOpponentCard(card) {

    if (!card) {
        return;
    }

    const red =
        card.color === "red"
            ? "red"
            : "";

    opponentCard.className =
        "playing-card card-open " +
        red;

    opponentCard.innerHTML =
        createCardHTML(card);

    opponentCard.classList.remove(
        "card-flip"
    );

    void opponentCard.offsetWidth;

    opponentCard.classList.add(
        "card-flip"
    );

}


/* ================= RESULT ================= */

socket.on(
    "round_result",
    (data) => {

        if (!data) {
            return;
        }


        duelActive = false;


        if (countdownTimer) {

            clearInterval(
                countdownTimer
            );

            countdownTimer = null;

        }


        /*
          Show opponent's card.
        */

        if (data.opponent_card) {

            showOpponentCard(
                data.opponent_card
            );

        }


        /*
          Make sure your card is visible.
        */

        if (data.your_card) {

            showCard(
                yourCard,
                data.your_card
            );

        }


        setTimeout(
            () => {

                showResult(
                    data.result
                );

            },
            650
        );

    }
);


/* ================= RESULT UI ================= */

function showResult(result) {

    resultBox.classList.remove(
        "hidden"
    );

    resultBox.classList.remove(
        "result-win",
        "result-lose",
        "result-draw"
    );


    let earned = 0;


    if (result === "win") {

        resultBox.classList.add(
            "result-win"
        );

        resultIcon.textContent =
            "🏆";

        resultTitle.textContent =
            "YOU WIN!";

        resultText.textContent =
            "Your card is higher.";

        earned = 100;

        soundWin();


        totalWins++;

        wins.textContent =
            totalWins;

    }


    else if (result === "loss") {

        resultBox.classList.add(
            "result-lose"
        );

        resultIcon.textContent =
            "💥";

        resultTitle.textContent =
            "YOU LOSE";

        resultText.textContent =
            "Opponent had the higher card.";

        earned = 0;

        soundLose();

    }


    else {

        resultBox.classList.add(
            "result-draw"
        );

        resultIcon.textContent =
            "🤝";

        resultTitle.textContent =
            "DRAW!";

        resultText.textContent =
            "Both cards have the same value.";

        earned = 25;

        soundDraw();

    }


    totalPoints += earned;


    score.textContent =
        totalPoints;


    pointsEarned.textContent =
        "+" + earned;


    gameState.textContent =
        "FINISHED";


    setArenaStatus(
        "🏁 Round finished"
    );


    /*
      Allow another round.
    */

    playAgainBtn.classList.remove(
        "hidden"
    );

}


/* ================= SAFETY RESET ================= */

window.addEventListener(
    "beforeunload",
    () => {

        try {

            socket.emit(
                "leave_match"
            );

        } catch (error) {

            /* Ignore browser closing errors */

        }

    }
);


/* ================= FINAL STARTUP ================= */

showScreen(
    homeScreen
);

findBtn.disabled = true;

setHomeStatus(
    "🔄 Connecting to server..."
);

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room
import random
import uuid
from threading import Lock
app = Flask(__name__)

app.config["SECRET_KEY"] = "high-card-duel-secret"

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="eventlet"
)

rooms = {}
waiting_players = []

lock = Lock()
RANKS = [
    ("2", 2),
    ("3", 3),
    ("4", 4),
    ("5", 5),
    ("6", 6),
    ("7", 7),
    ("8", 8),
    ("9", 9),
    ("10", 10),
    ("J", 11),
    ("Q", 12),
    ("K", 13),
    ("A", 14)
]

SUITS = [
    ("♠", "black"),
    ("♥", "red"),
    ("♦", "red"),
    ("♣", "black")
]


def create_deck():
    deck = []

    for rank, value in RANKS:
        for suit, color in SUITS:
            deck.append({
                "rank": rank,
                "value": value,
                "suit": suit,
                "color": color
            })

    random.shuffle(deck)
    return deck


def public_card(card):
    if not card:
        return None

    return {
        "rank": card["rank"],
        "suit": card["suit"],
        "color": card["color"]
    }


@app.route("/")
def index():
    return render_template("index.html")
  
@socketio.on("connect")
def handle_connect():
    emit(
        "connected",
        {
            "player_id": str(uuid.uuid4())
        }
    )


@socketio.on("find_match")
def find_match():
    sid = request.sid

    with lock:

        if sid in waiting_players:
            emit(
                "matchmaking",
                {
                    "status": "waiting",
                    "message": "Searching for an opponent..."
                }
            )
            return

        opponent = None

        while waiting_players:
            candidate = waiting_players.pop(0)

            if candidate != sid:
                opponent = candidate
                break

        if opponent is None:

            waiting_players.append(sid)

            emit(
                "matchmaking",
                {
                    "status": "waiting",
                    "message": "Searching for an opponent..."
                }
            )

            return
                  room_id = str(uuid.uuid4())

        rooms[room_id] = {
            "players": [opponent, sid],
            "deck": create_deck(),
            "cards": {},
            "finished": False
        }

    join_room(room_id, sid=sid)
    join_room(room_id, sid=opponent)

    numbers = {
        opponent: 1,
        sid: 2
    }

    for player_sid in (opponent, sid):

        emit(
            "match_found",
            {
                "room": room_id,
                "player_number": numbers[player_sid]
            },
            to=player_sid
        )

    socketio.start_background_task(
        start_round,
        room_id
          )
  def start_round(room_id):
    socketio.sleep(1)

    room = rooms.get(room_id)

    if not room:
        return

    for sid in room["players"]:
        emit(
            "round_start",
            {"countdown": 3},
            to=sid
        )

    socketio.sleep(3)

    room = rooms.get(room_id)

    if not room:
        return

    with lock:
        if room["finished"]:
            return

        room["cards"] = {
            room["players"][0]: room["deck"].pop(),
            room["players"][1]: room["deck"].pop()
        }

    for sid in room["players"]:
        emit(
            "reveal_card",
            {
                "card": public_card(
                    room["cards"][sid]
                )
            },
            to=sid
        )

    socketio.sleep(1)

    finish_round(room_id)
    def finish_round(room_id):
    room = rooms.get(room_id)

    if not room:
        return

    with lock:
        if room["finished"]:
            return

        player_a = room["players"][0]
        player_b = room["players"][1]

        card_a = room["cards"].get(player_a)
        card_b = room["cards"].get(player_b)

        if not card_a or not card_b:
            return

        room["finished"] = True

        if card_a["value"] > card_b["value"]:
            result = "player_a"

        elif card_b["value"] > card_a["value"]:
            result = "player_b"

        else:
            result = "draw"
              for sid in room["players"]:

        if result == "draw":
            outcome = "draw"

        elif result == "player_a":
            outcome = "win" if sid == player_a else "loss"

        else:
            outcome = "win" if sid == player_b else "loss"

        opponent_sid = (
            player_b
            if sid == player_a
            else player_a
        )

        emit(
            "round_result",
            {
                "result": outcome,
                "your_card": public_card(
                    room["cards"][sid]
                ),
                "opponent_card": public_card(
                    room["cards"][opponent_sid]
                )
            },
            to=sid
        )

    socketio.start_background_task(
        cleanup_room,
        room_id
      def cleanup_room(room_id):
    socketio.sleep(5)

    with lock:
        rooms.pop(room_id, None)


@socketio.on("leave_match")
def leave_match():
    sid = request.sid

    with lock:
        waiting_players[:] = [
            player
            for player in waiting_players
            if player != sid
        ]

        for room_id, room in list(rooms.items()):

            if sid in room["players"]:
                rooms.pop(room_id, None)
                break


@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid

    with lock:
        waiting_players[:] = [
            player
            for player in waiting_players
            if player != sid
        ]

        for room_id, room in list(rooms.items()):

            if sid in room["players"]:
                rooms.pop(room_id, None)
                break


if __name__ == "__main__":
    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=False
    )
    )

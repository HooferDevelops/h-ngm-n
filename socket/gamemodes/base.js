const QueueScheduler = require("../systems/queuescheduler")

class Base {
  constructor(globals, io, lobby) {
    this.globals = globals
    this.lobby = lobby
    this.io = io
    this.queue = new QueueScheduler(() => this.queueSchedulerCompleted)
    this.round_info = {}
    this.phrase = []
    this.guessed_letters = []
    this.last_turn_index = 99999999999
    this.failed_attempts = 0
  }

  sendInfoUpdate(should_play_sound) {
    let lobby_object = this.globals.lobbies[this.lobby];

    if (!lobby_object) {
      return;
    }

    for (const [key, user_info] of Object.entries(lobby_object.users)) {
      const user_socket = this.io.sockets.sockets.get(user_info.id);

      if (user_socket) {
        user_socket.emit("roundinfo", this.round_info)
        if (should_play_sound) {
          user_socket.emit(`${should_play_sound}sound`)
        }
      }
    }
  }

  startGame() {
    let lobby_object = this.globals.lobbies[this.lobby];

    if (!lobby_object) {
      return;
    }

    for (const [key, user_info] of Object.entries(lobby_object.users)) {
      const user_socket = this.io.sockets.sockets.get(user_info.id);

      if (user_socket) {
        user_socket.emit("roundstarted", {
          "access_code": this.lobby,
          "users": Object.values(lobby_object.users),
          "is_admin": lobby_object.users[Object.keys(lobby_object.users)[0]].id == user_socket.id
        })
      }
    }

    this.choosing_user = lobby_object.users[Object.keys(lobby_object.users)[
      Math.floor(Math.random() * (Object.keys(lobby_object.users).length))
    ]]

    this.queue.setQueueTime(60)

    this.round_info = {
      "current_user": this.choosing_user,
      "user_list": Object.values(lobby_object.users),
      "round_end_time": this.queue.queue_time,
      "display_message": `${this.choosing_user.name} is selecting the hangman word phrase!`,
      "round_state": "selecting_word"
    }

    this.sendInfoUpdate()

    const choosing_user_socket = this.io.sockets.sockets.get(this.choosing_user.id);


    this.queue.queue_function = () => {
      this.queue.setQueueTime(10)
      this.round_info.display_message = "No phrase was chosen in time! Picking random..."
      this.round_info.round_end_time = this.queue.queue_time

      if (choosing_user_socket) {
        choosing_user_socket.emit("phrasetoolate")
      }

      this.sendInfoUpdate()

      this.queue.queue_function = () => {
        this.startRound();
      }

      this.phrase_txt = "random phrase"
      let str_fin = []

      this.phrase_txt.split(" ").forEach((s) => {
        str_fin.push(s.split(""))
      })
      
      this.phrase = str_fin
    }

    choosing_user_socket.emit("choosephrase")

    choosing_user_socket.once("choosephrase", (data) => {
      choosing_user_socket.removeAllListeners("choosephrase")

      if (!data["phrase"]) {
        this.queue.forceQueueNext()
        return
      }

      if (data["phrase"].length > 20) {
        this.queue.forceQueueNext()
        return
      }

      if (data["phrase"].length <= 2) {
        this.queue.forceQueueNext()
        return
      }

      this.queue.queue_function = () => { }
      this.queue.clearQueueTime()

      let str_spl = data["phrase"].split(" ")
      this.phrase_txt = data["phrase"]
      let str_fin = []

      str_spl.forEach((s) => {
        str_fin.push(s.split(""))
      })

      this.phrase = str_fin

      this.queue.setQueueTime(5)
      this.round_info.display_message = "A phrase was chosen! Let us begin!"
      this.round_info.round_end_time = this.queue.queue_time
      this.sendInfoUpdate()

      this.queue.queue_function = () => {
        this.startRound();
      }
    })
  }

  sendWordUpdate() {
    this.round_info.phrase_data = JSON.parse(JSON.stringify(this.phrase)) // deep copy?

    this.round_info.phrase_data.forEach((list) => {
      let i = 0;
      list.forEach((letter) => {
        if (!this.guessed_letters.includes(letter.toUpperCase())) {
          list[i] = " "
        }
        i += 1
      })
    })

    this.sendInfoUpdate()
  }

  startRound() {
    let lobby_object = this.globals.lobbies[this.lobby];

    if (!lobby_object) {
      this.endGame();
    }

    // Choose First Player
    // Send States to Others
    // Send Choose State to Player

    this.queue.setQueueTime(2)
    this.round_info.display_message = "Choosing who gets to go next..."
    this.round_info.round_end_time = this.queue.queue_time

    this.sendWordUpdate()

    this.queue.queue_function = () => {
      let users = lobby_object.users;

      this.last_turn_index += 1

      if (this.last_turn_index > 99999) {
        this.last_turn_index = Math.floor(Math.random() * (Object.keys(lobby_object.users).length))
      }

      if (this.last_turn_index > Object.keys(users).length - 1) {
        this.last_turn_index = 0
      }

      if (users[Object.keys(users)[this.last_turn_index]].id == this.choosing_user.id) {
        this.last_turn_index += 1
      }

      if (this.last_turn_index > Object.keys(users).length - 1) {
        this.last_turn_index = 0
      }

      let player = users[Object.keys(users)[this.last_turn_index]];

      this.queue.setQueueTime(15)
      this.round_info.display_message = `${player.name} is choosing a letter to guess!`
      this.round_info.round_end_time = this.queue.queue_time
      this.round_info.current_user = player

      this.sendInfoUpdate()

      this.io.sockets.sockets.get(player.id).emit("chooseletter")
      this.io.sockets.sockets.get(player.id).once("chooseletter", (data) => {
        if (!data["letter"]) {
          this.queue.forceQueueNext();
          return;
        }

        if (data["letter"].length != 1) {
          this.queue.forceQueueNext();
          return;
        }

        this.queue.clearQueueTime();
        this.queue.setQueueTime(2)

        this.guessed_letters.push(data["letter"].toUpperCase())

        this.round_info.guessed_letters = this.guessed_letters

        this.round_info.display_message = `${player.name} guessed the letter ${data["letter"]}!`
        this.round_info.round_end_time = this.queue.queue_time
        this.round_info.current_user = player

        if (!this.phrase_txt.includes(data["letter"])) {
          this.failed_attempts += 1
        }

        this.round_info.failed_attempts = this.failed_attempts

        this.sendWordUpdate()
        this.sendInfoUpdate(!this.phrase_txt.includes(data["letter"]) ? "write" : null)

        this.queue.queue_function = () => {
          this.endRound()
        }
      })

      this.queue.queue_function = () => {
        this.io.sockets.sockets.get(player.id).removeAllListeners("chooseletter");
        this.queue.setQueueTime(5)
        this.round_info.display_message = `${player.name} did not choose a letter in time...`
        this.round_info.round_end_time = this.queue.queue_time
        this.round_info.current_user = player

        if (this.io.sockets.sockets.get(player.id)) {
          this.io.sockets.sockets.get(player.id).emit("choosetoolate")
        }
      
        this.sendInfoUpdate()
        this.queue.queue_function = () => {
          this.endRound()
        }
      }
    }
  }

  endRound() {
    // Send End State to Player
    if (this.failed_attempts >= 6) {
      this.queue.clearQueueTime()
      this.queue.setQueueTime(15)
      this.round_info.display_message = `The hangman has been completed! PHRASE WRITER WINS!`
      this.guessed_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
      this.round_info.guessed_letters = this.guessed_letters
      this.round_info.round_end_time = this.queue.queue_time

      this.sendWordUpdate()
      this.sendInfoUpdate("lose")

      this.queue.queue_function = () => {
        this.endGame()
      }

      return;
    }

    let completed = true
    this.phrase_txt.split("").forEach((letter) => {
      if (letter != " ") {
        if (!this.guessed_letters.includes(letter)) {
          completed = false
        }
      }
    })

    if (completed) {
      this.queue.clearQueueTime()
      this.queue.setQueueTime(15)
      this.round_info.display_message = `The phrase has been solved! GUESSERS WIN!`
      this.round_info.round_end_time = this.queue.queue_time
      this.sendInfoUpdate("win")

      this.queue.queue_function = () => {
        this.endGame()
      }

      return
    }

    this.startRound()
  }

  playerJoin(socket) {
    // Send State Update to Player List
    let lobby_object = this.globals.lobbies[this.lobby];

    if (!lobby_object) {
      return;
    }

    socket.emit("roundstarted", {
      "access_code": this.lobby,
      "users": Object.values(lobby_object.users),
      "is_admin": lobby_object.users[Object.keys(lobby_object.users)[0]].id == socket.id
    })

    this.round_info["user_list"] = Object.values(lobby_object.users)

    socket.emit("roundinfo", this.round_info)

    this.sendInfoUpdate()
  }

  playerLeave(socket) {
    // Check if Player is Important
    // Update Queue Handler if Needed
    // Send State Update to Player List
    let lobby_object = this.globals.lobbies[this.lobby];

    if (!lobby_object) {
      return;
    }

    this.round_info["user_list"] = Object.values(lobby_object.users)

    this.sendInfoUpdate()

    if (Object.keys(lobby_object.users).length <= 1) {
      this.queue.clearQueueTime()

      this.endGame()
    }
  }

  endGame() {
    let lobby_object = this.globals.lobbies[this.lobby];

    if (!lobby_object) {
      return;
    }


    this.round_info.phrase_data = [];
    this.round_info.guessed_letters = [];
    this.round_info.failed_attempts = 0;

    this.sendInfoUpdate();
    this.queue.clearQueueTime();

    this.globals.lobbies[this.lobby].game = null;

    for (const [key, user_info] of Object.entries(lobby_object.users)) {
      const user_socket = this.io.sockets.sockets.get(user_info.id);

      if (user_socket) {
        user_socket.removeAllListeners("choosephrase")
        user_socket.removeAllListeners("chooseletter")

        user_socket.emit("lobbyqueuedisplay", {
          "access_code": lobby_object.access_code,
          "users": Object.values(lobby_object.users),
          "is_admin": lobby_object.users[Object.keys(lobby_object.users)[0]].id == user_socket.id
        })
      }
    }
  }
}

module.exports = Base;
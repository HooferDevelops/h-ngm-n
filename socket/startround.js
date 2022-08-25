const Base = require("./gamemodes/base")

module.exports = (globals, io, socket) => {
  socket.on("startround", (data)=>{ try {
    let player_lobby = globals.socket_states[socket.id].current_lobby

    if (player_lobby && globals.lobbies[player_lobby]) {
      let lobby = globals.lobbies[player_lobby];
      if (lobby.users[Object.keys(lobby.users)[0]].id == socket.id) {
        if (Object.keys(lobby.users).length <= 1) {
          socket.emit("displayError", {
            "success": false,
            "message": "Failed to start - you need at least 2 players to start."
          })

          return;
        }
        lobby["game"] = new Base(globals, io, player_lobby);

        lobby["game"].startGame();
      }
    }
  } catch(err) {console.log(err)} })
}
module.exports = (globals, io, socket) => {
  socket.on("joinlobby", (data)=>{ try {
    let player_lobby = globals.socket_states[socket.id].current_lobby

    // Safety check
    if (player_lobby && globals.lobbies[player_lobby]) {
      socket.emit("displayError", {
        "success": false,
        "message": "Failed to join lobby - user is in a lobby."
      })

      return;
    }

    // Name check
    if (data["name"] == null || data["name"].toString().length < 3) {
      socket.emit("displayError", {
        "success": false,
        "message": "Failed to join lobby - display name must be more than 3 letters."
      })

      return;
    }

    if (data["name"] == null || data["name"].toString().length > 20) {
      socket.emit("displayError", {
        "success": false,
        "message": "Failed to join lobby - display name must be under 20 letters."
      })

      return;
    }

    data["access_code"] = data["access_code"].toUpperCase();

    // Lobby validity check
    if (data["access_code"] == null || globals.lobbies[data["access_code"]] == null) {
      socket.emit("displayError", {
        "success": false,
        "message": "Failed to join lobby - invalid join code."
      })

      return;
    }

    if (globals.lobbies[data["access_code"]].lobby_locked == true) {
      socket.emit("displayError", {
        "success": false,
        "message": "Failed to join lobby - lobby has already started the game."
      })

      return;
    }

    globals.lobbies[data["access_code"]].users[socket.id] = {
      "name": data["name"],
      "id": socket.id,
      "is_turn": false
    }

    globals.socket_states[socket.id].current_lobby = data["access_code"];

    for (const [key, user_info] of Object.entries(globals.lobbies[data["access_code"]].users)) {
      const user_socket = io.sockets.sockets.get(user_info.id);

      if (user_socket && user_socket != socket) {
        user_socket.emit("lobbyjoin", {
          "access_code": data["access_code"],
          "users": Object.values(globals.lobbies[data["access_code"]].users),
          "is_admin": globals.lobbies[data["access_code"]].users[Object.keys(globals.lobbies[data["access_code"]].users)[0]].id == user_socket.id
        })
      }
    }

    socket.emit("lobbyqueuedisplay", {
      "access_code": data["access_code"],
      "users": Object.values(globals.lobbies[data["access_code"]].users),
      "is_admin": globals.lobbies[data["access_code"]].users[Object.keys(globals.lobbies[data["access_code"]].users)[0]].id == socket.id
    })

    if (globals.lobbies[data["access_code"]].game) {
        globals.lobbies[data["access_code"]].game.playerJoin(socket);
    }

  } catch(err) { console.log(err) } })  
}
module.exports = (globals, io, socket) => {
  socket.on("leavelobby", (data)=>{ try {
    let player_lobby = globals.socket_states[socket.id].current_lobby

    if (player_lobby && globals.lobbies[player_lobby]){
      // This is disgusting.
      if (Object.keys(globals.lobbies[player_lobby].users).length == 0 || (globals.lobbies[player_lobby].users[socket.id] && Object.keys(globals.lobbies[player_lobby].users).length == 1)) {
        delete globals.lobbies[player_lobby];
        return;
      }

      if (globals.lobbies[player_lobby].users[socket.id]) {
        delete globals.lobbies[player_lobby].users[socket.id];
      }

      globals.socket_states[socket.id].current_lobby = "";
      
      for (const [key, user_info] of Object.entries(globals.lobbies[player_lobby].users)) {
        const user_socket = io.sockets.sockets.get(user_info.id);

        if (user_socket) {
          user_socket.emit("lobbyleave", {
            "access_code": player_lobby,
            "users": Object.values(globals.lobbies[player_lobby].users),
            "is_admin": globals.lobbies[player_lobby].users[Object.keys(globals.lobbies[player_lobby].users)[0]].id == user_socket.id
          })
        }
      }

      if (globals.lobbies[player_lobby].game) {
        globals.lobbies[player_lobby].game.playerLeave(socket);
      }
    }

 } catch(err) { console.log(err) } })
}
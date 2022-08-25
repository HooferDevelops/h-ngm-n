module.exports = (globals, io, socket) => {
  socket.on("locklobby", (data)=>{ try {
    let player_lobby = globals.socket_states[socket.id].current_lobby
    
    if (player_lobby && globals.lobbies[player_lobby]) {
      let lobby = globals.lobbies[player_lobby];
      if (lobby.users[Object.keys(lobby.users)[0]].id == socket.id) {
        lobby.lobby_locked = true;
      }
    }
  } catch {} })
}
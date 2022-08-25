module.exports = (globals, io, socket) => {
  let codeList = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","1","2","3","4","5","6","7","8","9","0"];
  
  socket.on('createlobby', (data) => { try {
    // Safety check
    if (globals.socket_states[socket.id].current_lobby && globals.lobbies[globals.socket_states[socket.id].current_lobby]){
      socket.emit("displayError", {
        "success": false,
        "message": "Failed to create lobby - user is hosting lobby."
      })

      return;
    }

    // Name check
    if (data["name"] == null || data["name"].toString().length < 3) {
      socket.emit("displayError", {
        "success": false,
        "message": "Failed to create lobby - display name must be 3 or more letters."
      })

      return;
    }

    if (data["name"] == null || data["name"].toString().length > 20) {
      socket.emit("displayError", {
        "success": false,
        "message": "Failed to create lobby - display name must be under 20 letters."
      })

      return;
    }


    // Code generation
    let code = "";

    for (x=0;x<9;x++){
      code += codeList[Math.floor(Math.random() * codeList.length)]
    }

    // Lobby creation
    globals.lobbies[code] = {
      "access_code": code,
      "users": [],
      "guessed_letters": [],
      "lobby_locked": false
    }

    socket.emit("joinlobby", {
      "success": true,
      "access_code": code
    })
    
  } catch {} });
}
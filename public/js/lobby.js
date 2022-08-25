console.log(`%c

  _   _   _____   _   _    ____   __  __   _____   _   _ 
 | | | | |     | | \\ | |  / ___| |  \\/  | |     | | \\ | |
 | |_| | |     | |  \\| | | |  _  | |\\/| | |     | |  \\| |
 |  _  | |     | | |\\  | | |_| | | |  | | |     | | |\\  |
 |_| |_| |_____| |_| \\_|  \\____| |_|  |_| |_____| |_| \\_|


  -- CREATED BY THE TYPICAL DEVELOPERS TEAM W/ HELP FROM MIO --
  
  --       MAINLY MADE BY HUNTER/HOOFER BUT WHO CARES!?      --

  JS CODE-BASE MAINTAINED BY:
    HUNTER/HOOFER -       https://github.com/HooferDevelops
    COLT/LUCKFIRE -       https://github.com/LuckFire
    JONATHAN/AKKOZA -     https://github.com/akkozadevelops

  HTML CODE-BASE MAINTANED BY:
    HUNTER/HOOFER -       https://github.com/HooferDevelops
    CONNER/MIO -          https://github.com/MioDevelops

  CSS CODE-BASE MAINTAINED BY:
    HUNTER/HOOFER -       https://github.com/HooferDevelops
    COLT/LUCKFIRE -       https://github.com/LuckFire

`, "font-size: 15px; color: rgb(107, 91, 255);")

var socket = io();

!function(){

// * Sounds * //
let click = new Audio("/sounds/click.ogg");
click.load();
let drop = new Audio("/sounds/drop.ogg");
drop.load();
let error = new Audio("/sounds/error.ogg");
error.load();
let join = new Audio("/sounds/join.ogg");
join.load();
let leave = new Audio("/sounds/leave.ogg");
leave.load();
let win = new Audio("/sounds/win.wav");
win.load();
let lose = new Audio("/sounds/lose.wav");
lose.load();
let write = new Audio("/sounds/write.ogg");
write.load();

// * Utility Functions * //

// https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
function fade(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 50);
}

// https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
function unfade(element) {
    var op = 0.1;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
}

// * Disconnecting Socket Display * //
let retry_attempts = 0;

socket.on("disconnect", (reason) => {
  if (current_open_menus["disconnected-menu"]) {
    return;
  }
  setDisplayActiveHideAll("disconnected-menu");
})

socket.on("connect_error", () => {
  retry_attempts += 1;

  if (retry_attempts > 5) {
    if (current_open_menus["disconnected-menu"]) {
      return;
    }
    setDisplayActiveHideAll("disconnected-menu");
  }
});

// * Screen Menu Rendering Functionality * //
let current_open_menus = {}

function refreshDisplays() {
  let keys = Object.keys(current_open_menus);
  
  for (var x=0;x<keys.length;x++) {
    if (current_open_menus[keys[x]]) {
      document.getElementById(keys[x]).style.display = "inherit";
    } else {
      document.getElementById(keys[x]).style.display = "none";
    }
  }
}

function setDisplayActive(display_name) {
  current_open_menus[display_name] = true;
  refreshDisplays();
}

function setDisplayActiveHideAll(display_name) {
  drop.play();

  let keys = Object.keys(current_open_menus);
  
  for (var x=0;x<keys.length;x++) {
    current_open_menus[keys[x]] = false;
  }

  setDisplayActive(display_name);
}

function setDisplayInactive(display_name) {
  current_open_menus[display_name] = false;
  refreshDisplays();
}

setDisplayActive("join-menu")

// * Theme Toggle * //
const toggle_toggle_button = document.getElementById("theme-toggle-button");

document.documentElement.className = localStorage.getItem('theme');

toggle_toggle_button.onclick = () => {
  document.documentElement.className = document.documentElement.className == "dark" ? "light" : "dark";
  localStorage.setItem('theme', document.documentElement.className);
}

// * Lobby Information * //
var room_information = {}

// * Join Menu * //
const join_menu = document.getElementById("join-menu")

const display_name_input = document.getElementById("display-name")
const join_code_input = document.getElementById("join-code")
const join_lobby_button = document.getElementById("join-button")
const create_lobby_button = document.getElementById("create-button")

// * Join Menu Functionality * //
create_lobby_button.onclick = () => {
  socket.emit("createlobby" , {
    name: display_name_input.value
  });
}

join_lobby_button.onclick = () => {
  // Easter eggs
	switch(join_code_input.value) {
		case 'MIO':
			special()
			break;
		case 'WIZARD':
			special()
			break;
		case 'H4X0R':
			special()
			break;
    case 'TYPICAL':
			special()
			break;
    case 'KECHIPH':
      special()
      break;
		default:
			break;
	}
  
	function special() {
		localStorage.setItem('theme', join_code_input.value.toLowerCase());
		location.reload();
	}

  socket.emit("joinlobby" , {
    name: display_name_input.value,
    access_code: join_code_input.value
  });
}

// * Automatically Get Share Code * //
const query = window.location.search;
const url_params = new URLSearchParams(query);
const lobby_code = url_params.get('lobby')

if (lobby_code) {
  join_code_input.value = lobby_code
}

// * Joining Lobby Functionality * //
socket.on("joinlobby", (data) => {
  socket.emit("joinlobby" , {
    name: display_name_input.value,
    access_code: data["access_code"]
  });
})

// * Leaving Lobby Functionality * //
const leave_lobby_button = document.getElementById("leave-button")

leave_lobby_button.onclick = () => {
  socket.emit("leavelobby")
  setDisplayActiveHideAll("join-menu")
}

// * Starting Lobby Functionality * //
const start_lobby_button = document.getElementById("start-button")

start_lobby_button.onclick = () => {
  console.log("send start")
  socket.emit("startround")
}

// * Lobby Queue Functionality * //
let lobby_queue_information = {}

function updateLobbyQueue() {
  document.getElementById("queue-code").innerText = lobby_queue_information["access_code"];
  document.getElementById("queue-user-list").innerHTML = "";
  
  let first_user = true;
  lobby_queue_information.users.forEach((user) => {
    let user_element = document.createElement("p");
    user_element.innerText = user.name;
    
    if (first_user) {
      user_element.style.color = "var(--main-color)"
    }

    document.getElementById("queue-user-list").appendChild(user_element);
    
    first_user = false;
  })

  if (lobby_queue_information.is_admin == true) {
    document.getElementById("queue-host-only").style.display = "inherit";
  } else {
    document.getElementById("queue-host-only").style.display = "none";
  }
}

document.getElementById("queue-link").onclick = () => {
  navigator.clipboard.writeText(`https://h-ngm-n.typicaldevs.co?lobby=${document.getElementById("queue-code").innerText}`).then(function() {
    join.play();
  }, function(err) {})
}

socket.on("lobbyqueuedisplay", (data) => {
  lobby_queue_information = data;
  setDisplayActiveHideAll("queue-menu");
  updateLobbyQueue();
})

socket.on("lobbyjoin", (data) => {
  join.play();
  lobby_queue_information = data;
  updateLobbyQueue();
})

socket.on("lobbyleave", (data) => {
  leave.play();
  lobby_queue_information = data;
  updateLobbyQueue();
})

// * Round Starting * //
socket.on("roundstarted", (data) => {
  setDisplayActiveHideAll("round-menu")
})

// * Round Info Displaying * //
const round_user_list = document.getElementById("round-user-list")
const round_info_text = document.getElementById("round-info-text")
const round_info_time = document.getElementById("round-info-time")
const round_info_phrase = document.getElementById("round-word-menu")


let round_info = {}

setInterval(()=>{
  if (round_info.round_end_time) {
    let time = new Date(round_info.round_end_time) - new Date().getTime();
    round_info_time.innerHTML = Math.max(Math.floor(time/1000), 0).toString();
  }
}, 10)

function updateRoundList(){
  round_user_list.innerHTML = "";
  round_info_text.innerText = round_info.display_message;

  if (round_info.phrase_data && round_info.phrase_data[0]) {
    round_info_phrase.innerHTML = ""

    round_info.phrase_data.forEach((data) => {
      let spacer_element = document.createElement("div");
      spacer_element.className = "spacer";

      data.forEach((letter) => {
        let key_element = document.createElement("div");
        key_element.className = "key";
        key_element.innerText = letter;
        spacer_element.appendChild(key_element);
      })

      round_info_phrase.appendChild(spacer_element);
    })

    setDisplayActive("round-word-menu")
    setDisplayActive("round-hangman")
  } else {
    setDisplayInactive("round-word-menu")
    setDisplayInactive("round-hangman")
  }
  
  let scroll_view = null;

  round_info.user_list.forEach((user) => {
    let user_element = document.createElement("p");
    user_element.innerText = user.name;
    user_element.className = "round-user"

    if (user.id == round_info.current_user.id) {
      user_element.style.color = "var(--main-color)"
      scroll_view = user_element;
    }

    round_user_list.appendChild(user_element);
  })

  if (scroll_view) {
    scroll_view.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
  }

  let fallback_states = ["head", "torso", "left-arm", "right-arm", "left-leg", "right-leg"]
  if (round_info.failed_attempts && round_info.failed_attempts != 0) {
    let limb_states = []
    
    if (round_info.failed_attempts >= 1) {
      limb_states.push("head")
    }
    if (round_info.failed_attempts >= 2) {
      limb_states.push("torso")
    }
    if (round_info.failed_attempts >= 3) {
      limb_states.push("left-arm")
    }
    if (round_info.failed_attempts >= 4) {
      limb_states.push("right-arm")
    }
    if (round_info.failed_attempts >= 5) {
      limb_states.push("left-leg")
    }
    if (round_info.failed_attempts >= 6) {
      limb_states.push("right-leg")
    }

    fallback_states.forEach((limb_name) => {
      if (limb_states.includes(limb_name)) {
        document.getElementById(limb_name).style.display = "inherit";
      } else {
        document.getElementById(limb_name).style.display = "none";
      }
    })
  } else {
    fallback_states.forEach((limb_name) => {
      document.getElementById(limb_name).style.display = "none";
    })
  }
}

socket.on("roundinfo", (data) => {
  for (var x=0; x<Object.keys(data).length;x++){
    round_info[Object.keys(data)[x]] = Object.values(data)[x];
  }
  //round_info = data;
  updateRoundList();
})

// * Phrase Enter Menu * //
var phrasePreview = document.getElementById("phrase-input-text")
phrasePreview.innerText = ""

let keyButtons = document.getElementById("keyboard-phrase").querySelectorAll('.key');

keyButtons.forEach((button) => {
  button.onclick = () => {
    if (button.innerText.length == 1) {
      if (phraseEntered.length < 20) {
        phraseEntered += button.innerText
        phrasePreview.innerText = phraseEntered
      }
    }

    switch(button.innerText) {
	    case 'BACKSPACE':
        phraseEntered = phraseEntered.substring(0, phraseEntered.length - 1);
        phrasePreview.innerText = phraseEntered
        break;
      case 'SUBMIT':
        if (phraseEntered.length <= 2) {
          return;
        }

        phrasePreview.innerText = ""

        setDisplayInactive("round-phrase-menu");
        
        socket.emit("choosephrase", {
          "phrase": phraseEntered
        });
        
        phraseEntered = ""
        break;
      case '[_]':
        if (phraseEntered.length < 20) {
          phraseEntered += " ";
        }
        break;
    }
  }
})

socket.on("choosephrase", (data) => {
  phraseEntered = "";
  setDisplayInactive("round-hangman");
  setDisplayActive("round-phrase-menu");
})

socket.on("phrasetoolate", (data) => {
  setDisplayInactive("round-phrase-menu");
})


// * Letter Guess Menu * //
let guessKeyButtons = document.getElementById("round-guess-menu").querySelectorAll(".key")

function refreshGuessButtons(){
  guessKeyButtons.forEach((button) => {
    if (round_info.guessed_letters && round_info.guessed_letters.includes(button.innerText.toUpperCase())) {
      button.style.color = "rgb(255 0 69)"
      button.disabled = true
    } else {
      button.style.color = null
      button.disabled = null
    }
  })
}

guessKeyButtons.forEach((button) => {
  button.onclick = () => {
    if (button.innerText.length == 1) {
      setDisplayInactive("round-guess-menu");
      socket.emit("chooseletter", {
          "letter": button.innerText
      });
    }
  }
})

socket.on("chooseletter", (data) => {
  refreshGuessButtons();
  setDisplayInactive("round-hangman");
  setDisplayActive("round-guess-menu");
})

socket.on("choosetoolate", (data) => {
  setDisplayInactive("round-guess-menu");
})

// * Write / Win / Lose Sounds * //
socket.on("writesound", () => {
  write.play();
})

socket.on("winsound", (data) => {
  win.play();
})

socket.on("losesound", (data) => {
  lose.play();
})



// * Displaying Errors * //
const error_banner = document.getElementById("error-banner")

socket.on("displayError", (data) => {
  if (data["message"]) {
    error.play();
    
    let error_message_element = error_banner.cloneNode(true);
    error_message_element.id = "error-" + Math.floor(Math.random()*10000).toString();
    error_message_element.style.display = "inherit";
    error_message_element.style.opacity = 0.1;
    
    error_message_element.childNodes[1].innerText = data["message"];

    document.body.prepend(error_message_element)
    unfade(error_message_element)
    
    setTimeout(()=>{
      fade(error_message_element)
      setTimeout(()=>{
        error_message_element.remove()
      }, 5000)
    }, 1000)
  }
})

// * Falling Letter Background Effect * //
const letterList = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

const falling_letter = document.getElementById("falling-letter")

let current_falling_letters = 0;

function createLetter(){
  let letter_element = falling_letter.cloneNode(true);
  
  letter_element.id = "letter-" + Math.floor(Math.random()*10000).toString();
  letter_element.style.display = "inherit";
  letter_element.style.top = top + "px";
  letter_element.style.left = Math.floor(Math.random()*window.innerWidth) + "px";
  switch(document.documentElement.className) {
	  case 'wizard':
	    letter_element.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="60px" width="60px" viewBox="0 0 24 24" width="24px" fill="#fcd53f"><g><path d="M0,0h24v24H0V0z" fill="none"/><path d="M0,0h24v24H0V0z" fill="none"/></g><g><path d="M12,17.27L18.18,21l-1.64-7.03L22,9.24l-7.19-0.61L12,2L9.19,8.63L2,9.24l5.46,4.73L5.82,21L12,17.27z"/></g></svg>'
	    break;
    case 'kechiph':
      letter_element.innerHTML = '<img src="/images/kechiph.png" width="60px" height="60px">'
      break;
	  case 'h4x0r':
		  const cookies = ['0','1']
			letter_element.style.color = "lime"
      letter_element.innerText = Math.floor(Math.random()*cookies.length)
      break
    case 'typical':
      // https://helderesteves.com/generating-random-colors-js/#Generating_random_light_colors
      let color = "#";
      for (let i = 0; i < 3; i++)
        color += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);

      letter_element.style.color = color
      letter_element.innerText = letterList[Math.floor(Math.random()*letterList.length)]
    default:
  	  letter_element.innerText = letterList[Math.floor(Math.random()*letterList.length)]
		  break;
  }
  document.getElementById("letters").prepend(letter_element)
  
  return letter_element;
}

function fadeFallLetter(){
  let letter = createLetter();
  current_falling_letters += 1;

  var op = 1;
  var top = 1;
  var rot_dir = Math.random() > 0.5 ? 1 : -1;
  var rot = Math.floor(Math.random()*360);

  var timer = setInterval(function () {
      if (op <= 0.1){
        clearInterval(timer);
        current_falling_letters -= 1;
        letter.remove();
      }
      letter.style.opacity = op;
      letter.style.top = top + "px";
      letter.style.filter = 'alpha(opacity=' + op * 100 + ")";
			if (document.documentElement.className !== 'h4x0r') {
				letter.style.transform = "rotate(" + rot + "deg)"
			}
      op -= 0.003;
      top = top + Math.floor(Math.random()*10)/10 + .5;
      rot = rot + (Math.random() * rot_dir)
  }, 1);
}


setInterval(()=>{
  for (var i=0;i<Math.floor(Math.random()*4);i++){
    if (current_falling_letters < 50){
      fadeFallLetter();
    }
  }
}, 100)

// * Button Click Sounds * //
let handleClick = function(e) {
    click.play();
};

let buttons = document.querySelectorAll('.sound-click');
buttons.forEach(button => {
    button.addEventListener('click', handleClick);
});




















// element.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});

}()
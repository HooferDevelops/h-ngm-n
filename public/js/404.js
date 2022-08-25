// * Theme Loading * //
document.documentElement.className = localStorage.getItem('theme');

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
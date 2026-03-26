 /* ------------------------------
   Layout - layout the screen
   ------------------------------ */


function positionHelpButton() {
  const btn = dei("helpBtn");
    btn.style.position = "absolute";
    
    btn.style.top   = (window.innerHeight * 0.05) + "px";
    btn.style.right = (window.innerWidth * 0.20) + "px";
}

window.addEventListener("load", positionHelpButton);
window.addEventListener("resize", positionHelpButton);


function positionSaveButton() {
  const btn = document.getElementById("saveBtn");

  btn.style.position = "absolute";

//    btn.style.left = ((window.innerWidth - btn.offsetWidth) - 100) + "px";
//    btn.style.top  = ((window.innerHeight - btn.offsetHeight) - 600) + "px";
    btn.style.top   = (window.innerHeight * 0.05) + "px";
    btn.style.right = (window.innerWidth * 0.10) + "px";

}

window.addEventListener("load", positionSaveButton);
window.addEventListener("resize", positionSaveButton);




function positionPuzzleSelector() {
    const wrapper = document.getElementById("puzzleSelectorWrapper");
    const input = document.getElementById("puzzleInput");
    
    wrapper.style.position = "absolute";
    
    // 5% from bottom, 10% from right
    wrapper.style.bottom = (window.innerHeight * 0.02) + "px";
    wrapper.style.right  = (window.innerWidth  * 0.10) + "px";
    
    input.style.width = "6ch";   // visually 4 characters wide
    input.maxLength = 4;         // restrict input to 4 characters

}

window.addEventListener("load", positionPuzzleSelector);
window.addEventListener("resize", positionPuzzleSelector);

function positionJoinerButton() {
  const btn = dei("joinerBtn");
    btn.style.position = "absolute";
    
    btn.style.top   = (window.innerHeight * 0.05) + "px";
    btn.style.right = (window.innerWidth * 0.25) + "px";
}

window.addEventListener("load", positionJoinerButton);
window.addEventListener("resize", positionJoinerButton);

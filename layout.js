 /* ------------------------------
   Layout - layout the screen
   ------------------------------ */


function positionHelpButton() {
//  const btn = document.getElementById("helpBtn");
  const btn = dei("helpBtn");
//  const wrapper = document.querySelector(".wrapper");

  btn.style.position = "absolute";

  // Example: anchor bottom‑right of wrapper
//  btn.style.left = (wrapper.offsetWidth - btn.offsetWidth - 20) + "px";
//    btn.style.top = ((wrapper.offsetHeight - btn.offsetHeight) - 70) + "px";

//    btn.style.left = ((window.innerWidth - btn.offsetWidth) - 200) + "px";
//    cLog(window.innerWidth);
    
//    btn.style.top  = ((window.innerHeight - btn.offsetHeight) - 600) + "px";
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

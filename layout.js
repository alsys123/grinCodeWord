/* ------------------------------
   Layout - layout the screen
   ------------------------------ */


function positionHelpButton() {
    const btn = dei("helpBtn");
    btn.style.position = "absolute";
    
    btn.style.top   = (window.innerHeight * 0.05) + "px";
    //    btn.style.right = (window.innerWidth * 0.20) + "px";
    btn.style.left = (window.innerWidth * 0.05) + 100 + "px";

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


// *** ??? move these to layout.js

// 1-13 key
function positionKeyTop() {
    const kt = document.getElementById("keyTop");
    const wrapper = document.querySelector(".wrapper");

    // Make vertical
    kt.style.display = "grid";
    kt.style.gridTemplateColumns = "40px";   // 1 column
    kt.style.gridAutoRows = "40px";
    kt.style.gap = "3px";

    // Anchor inside wrapper
    kt.style.position = "absolute";

    // Position: right side of wrapper
    kt.style.left = ((wrapper.offsetWidth - kt.offsetWidth) - 150) + "px"; // was -50

    // Position: top of wrapper
    kt.style.top = "45px";
}

//14-26 key
function positionKeyBottom() {
    const kb = document.getElementById("keyBottom");
    const wrapper = document.querySelector(".wrapper");

    // Make it vertical
    kb.style.display = "grid";
    kb.style.gridTemplateColumns = "40px";   // 1 column
    kb.style.gridAutoRows = "40px";          // vertical stack
    kb.style.gap = "3px";

    // Anchor inside wrapper
    kb.style.position = "absolute";

    // Position: right side of wrapper
    kb.style.left = ((wrapper.offsetWidth - kb.offsetWidth) -110) + "px"; // was -10

    // Position: top of wrapper (adjust as needed)
    kb.style.top = "45px";
}

window.addEventListener("load", () => {
    positionKeyTop();
    positionKeyBottom();
});

window.addEventListener("resize", () => {
    positionKeyTop();
    positionKeyBottom();
});


function positionAlert() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    //    dei("status").textContent = "hi there";
    //    statusEl.textContent = "hi there";

    // Default: top center
    let top = "20px";
    let left = "50%";
    let transform = "translateX(-50%)";

    // If the screen is very tall (portrait phones)
    if (h > w * 1.3) {
	top = "10px";
	left = "50%";
	transform = "translateX(-50%)";
    }

    // If the screen is very wide (landscape tablets)
    if (w > h * 1.4) {
	top = "20px";
	left = "calc(100% - 200px)"; // right side
	transform = "none";
    }

    // If the screen is small (tiny phones)
    if (w < 400) {
	top = "5px";
	left = "50%";
	transform = "translateX(-50%) scale(0.9)";
    }

    alertEl.style.top = top;
    alertEl.style.left = left;
    alertEl.style.transform = transform;
}//positionAlert

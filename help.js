

/* ------------------------------
   Help
   ------------------------------ */
let helpVisible = false;


function positionCheckButton() {
} //positionCheckButton

window.addEventListener("resize", positionCheckButton);
positionCheckButton();

document.getElementById("helpBtn").addEventListener("click", () => {
    toggleHelp(true);
});


document.getElementById("helpCloseBtn").addEventListener("click", () => {
    toggleHelp(false);
});

document.getElementById("helpCloseBtn").addEventListener("pointerup", (e) => {
//    e.stopPropagation();  // prevent drag logic
    toggleHelp(false);
});

function toggleHelp(show) {
    const panel = document.getElementById("helpPanel");
    helpVisible = show;

    if (show) {
	panel.classList.remove("hidden");
	loadHelpContent("drawing"); // default section
    } else {
	panel.classList.add("hidden");
    }
}

// Context switching
document.querySelectorAll("#helpPanel .help-buttons button")
    .forEach(btn => {
	btn.addEventListener("click", () => {
	    const topic = btn.dataset.help;
	    loadHelpContent(topic);
	});
    });

function loadHelpContent(topic) {
    const content = document.querySelector("#helpPanel .help-content");

    if (topic === "drawing") {
	content.innerHTML = `
      <h3>How to Draw Letters</h3>
      <p>Use your finger or stylus to draw a single letter inside a cell.</p>
      <img src="help/letters.png" style="width:100%;border:1px solid #ccc;">
    `;
    }

    if (topic === "letters") {
	content.innerHTML = `
      <h3>Letter Shapes</h3>
      <p>Draw letters using simple, clean strokes. Avoid cursive or loops.`;
    }

    if (topic === "joiners") {
	content.innerHTML = `
      <h3>Joiner Tool</h3>
      <p>Tap two cells to create or remove a joiner line between them.</p>
      <p>Joiners must be horizontal or vertical.</p>
    `;
    }
    if (topic === "saving") {
	content.innerHTML = `
      <h3>Saving A Puzzle</h3>
      <p>To mark a puzzle as completed and saved, press the Check Answers button.</p>
      <p>A gree checkmark will appear in the title bar for that particular puzzle.</p>
    `;
    }

}

/* future...
//avoid taps during help
function toggleHelp(show) {
const panel = document.getElementById("helpPanel");
helpVisible = show;

if (show) {
joinerMode = false;
selectedLetter = null;
panel.classList.remove("hidden");
loadHelpContent("drawing");
} else {
panel.classList.add("hidden");
}
}
*/

document.getElementById("enableDrawingBtn").addEventListener("click", () => {
    if (!drawingEnabled) {
        const ok = confirm(
            "Drawing mode is experimental and may not always recognize letters correctly.\n\n" +
		"Enable it anyway?"
        );
        if (!ok) return;

        drawingEnabled = true;
        document.getElementById("enableDrawingBtn").textContent = "Disable Drawing Mode";
    } else {
        drawingEnabled = false;
        document.getElementById("enableDrawingBtn").textContent = "Enable Drawing Mode";
    }
    // ⭐ THIS is where the toggle goes
    document.body.classList.toggle("drawing-enabled", drawingEnabled);
});

document.getElementById("enableDictionaryBtn").addEventListener("click", () => {

    if (!dictionaryLookupEnabled) {
	/*
        const ok = confirm(
            "Dictionary lookup mode is experimental.\n\n" +
		"Tap a square to look up the letter’s word.\n\n" +
		"Enable it anyway?"
        );
        if (!ok) return;
	*/

	
        dictionaryLookupEnabled = true;
        document.getElementById("enableDictionaryBtn").textContent =
            "Disable Dictionary Lookup";
    } else {
        dictionaryLookupEnabled = false;
        document.getElementById("enableDictionaryBtn").textContent =
            "Enable Dictionary Lookup";
    }
    // ⭐ THIS is where the toggle goes
    document.body.classList.toggle("dictionaryLookup-enabled", dictionaryLookupEnabled);
});

// ?? one day ... generalize this and put it in utils .. so it can be re-useable.
function makeHelpPopupDraggable() {
    const panel = document.getElementById("helpPanel");
    const handle = document.getElementById("helpDragHandle");

    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    
    function freezePosition() {
        const rect = panel.getBoundingClientRect();
        panel.style.left = rect.left + "px";
        panel.style.top  = rect.top + "px";
//        panel.style.transform = "none";   // remove centering AFTER freezing
    }
    
    
    handle.addEventListener("mousedown", (e) => {
        isDragging = true;

        // Remove centering transform so dragging works naturally
//        panel.style.transform = "none";

        freezePosition();   // ⭐ prevents the jump
        panel.style.transform = "none";
	
        const rect = panel.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        panel.style.left = (e.clientX - offsetX) + "px";
        panel.style.top  = (e.clientY - offsetY) + "px";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        document.body.style.userSelect = "";
    });
    
    // ---- iPAD / TOUCH SUPPORT ----
    handle.addEventListener("touchstart", (e) => {
        isDragging = true;

	freezePosition();   // ⭐ prevents the jump
        panel.style.transform = "none";

        const touch = e.touches[0];
        const rect = panel.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;

        e.preventDefault(); // prevents Safari from scrolling instead of dragging
    }, { passive: false });

    document.addEventListener("touchmove", (e) => {
        if (!isDragging) return;

        const touch = e.touches[0];
        panel.style.left = (touch.clientX - offsetX) + "px";
        panel.style.top  = (touch.clientY - offsetY) + "px";

        e.preventDefault(); // required for iPad dragging
    }, { passive: false });

    document.addEventListener("touchend", () => {
        isDragging = false;
    });
}

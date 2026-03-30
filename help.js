

 /* ------------------------------
   Help
   ------------------------------ */
let helpVisible = false;


function positionCheckButton() {
/* ... out for now
    const btn = document.getElementById("checkBtn");

    const w = window.innerWidth;
    const h = window.innerHeight;

//        dei("status").textContent = "hi there";
    statusEl.textContent = `Position: Width = ${w}. Height = ${h}`;

    btn.style.position = "absolute";

    // desktop
  if (w > 900 && h > 650) {
    // phones
    btn.style.top = "8px";
    btn.style.left = "15px";
  } else if (w < 1000) {
    // tablets
    btn.style.top = "10px";
    btn.style.left = "10px";
//    btn.style.left = "calc(100% - 120px)";
  } else {
    // desktops
    btn.style.top = "10px";
//    btn.style.top = "calc(100% - 60px)";
    btn.style.left = "-60px";
    }
    */
} //positionCheckButton

window.addEventListener("resize", positionCheckButton);
positionCheckButton();

document.getElementById("helpBtn").addEventListener("click", () => {
  toggleHelp(true);
});

document.getElementById("helpCloseBtn").addEventListener("click", () => {
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
      <p>Draw letters using simple, clean strokes. Avoid cursive or loops.</p>
      <img src="help/letters2.png" style="width:100%;border:1px solid #ccc;">
    `;
  }

  if (topic === "joiners") {
    content.innerHTML = `
      <h3>Joiner Tool</h3>
      <p>Tap two cells to create or remove a joiner line between them.</p>
      <p>Joiners must be horizontal or vertical.</p>
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


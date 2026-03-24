  /* ------------------------------
   Main routine
   ------------------------------ */

let PUZZLES = {};   // will be filled from JSON
let selectedLetter = null;

async function loadPuzzleData() {
  const response = await fetch("puzzleData.json");
  PUZZLES = await response.json();
}

const rows = 13;
    const cols = 13;
    const inactivityDelay = 1200; // Slightly faster recognition

    const gridEl = document.getElementById('grid');
    const keyTop = document.getElementById('keyTop');
    const keyBottom = document.getElementById('keyBottom');
    const statusEl = document.getElementById('status');
    const alertEl = document.getElementById('alert');
//    const hintEl = document.getElementById('hintText');
    const checkBtn = document.getElementById('checkBtn');

    const cells = [];

function showAlert() {
    alertEl.style.display = "block";
    alertEl.style.opacity = "1";
    setTimeout(() => {
        alertEl.style.transition = "opacity 0.8s";
        alertEl.style.opacity = "0";
        setTimeout(() => {
            alertEl.style.display = "none";
            alertEl.style.transition = "";
        }, 800);
    }, 2000);
}

function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    return { canvas, ctx };
    
    }

function createCell(number) {
      const cell = document.createElement('div');
      cell.className = 'cell';

      const numberLabel = document.createElement('div');
      numberLabel.className = 'number-label';
      numberLabel.textContent = number;
      cell.appendChild(numberLabel);

      const { canvas, ctx } = createCanvas();
      cell.appendChild(canvas);

      const cellData = {
        number,
        cell,
        canvas,
        ctx,
        drawing: false,
        lastX: 0,
        lastY: 0,
        timer: null,
        recognized: false,
        lastTap: 0,
        starter: false
      };

      setupDrawing(cellData);
      setupDoubleTap(cellData);
//    attachAlphabetClickFill(cellData);   // ⭐ here
        
    return cellData;
} //createCell

function createGrid() {

//    grid.innerHTML = ""; // clear out any old one if it exists

    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const num = gridNumbers[r][c];
	    
            if (num === 0) {
		const black = document.createElement('div');
		black.className = 'cell black';
		gridEl.appendChild(black);
		continue;
            }
	    
            const cd = createCell(num);
            gridEl.appendChild(cd.cell);
            cells.push(cd);
        }
    }
    
    applyStarters();
    
    buildAlphabetBar();
    
}//createGrid

function applyStarters() {
    hintPairs.forEach(h => {
//        const target = cells.find(cd => cd.number === h.number && !cd.starter);
	const target = cells.find(cd => cd.number === h.number);

        if (target) {
            placeLetter(target, h.letter, true);
            target.starter = true;
            target.recognized = true;

	    propagateLetter(target.number, h.letter, true); // NEW

	    markAlphabetUsed(h.letter);

        }
    });

//    hintEl.textContent = `Hints: ${hintPairs[0].number} = ${hintPairs[0].letter}   ${hintPairs[1].number} = ${hintPairs[1].letter}`;

    
    // here i am ?????
    
    // TEST JOINER
    const cellA = cells[23].cell;
    const cellB = cells[24].cell;
    drawJoiner(cellA, cellB);

} //applyStarters


function setupDoubleTap(cellData) {
    const handler = () => {
        const now = Date.now();
        if (now - cellData.lastTap < 280) {
            if (cellData.recognized && !cellData.starter) {

      // ⭐ FIX: reset recognized BEFORE clearing
		cellData.recognized = false;
		
//		clearCell(cellData);
		        propagateClear(cellData.number);
            }
        }
        cellData.lastTap = now;
    };

    cellData.cell.addEventListener('touchend', handler);
    cellData.cell.addEventListener('click', handler);
}//setupDoubleTap

function clearCell(cellData) {
      const { number, cell } = cellData;
      cell.innerHTML = '';

      const numberLabel = document.createElement('div');
      numberLabel.className = 'number-label';
      numberLabel.textContent = number;
      cell.appendChild(numberLabel);

      const { canvas, ctx } = createCanvas();
      cell.appendChild(canvas);

      cellData.canvas = canvas;
      cellData.ctx = ctx;
      cellData.recognized = false;
      cellData.starter = false;

      setupDrawing(cellData);
    setupDoubleTap(cellData);

//    attachAlphabetClickFill(cellData);   // ⭐ reattach here

} //clearCell

/*
// worker function
function attachAlphabetClickFill(cellData) {
  cellData.cell.addEventListener('click', () => {
//  cellData.canvas.addEventListener('click', () => {
    if (!selectedLetter) return;
    if (cellData.starter) return;

    placeLetter(cellData, selectedLetter, false);
    propagateLetter(cellData.number, selectedLetter);
    cellData.recognized = true;

    // clear selection after placing
    document.querySelectorAll('.alpha-letter').forEach(el =>
      el.classList.remove('selected')
    );
    selectedLetter = null;
  });
}//attachAlphabetClickFill
*/

    function getPos(canvas, evt) {
      const rect = canvas.getBoundingClientRect();
      const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    }

function setupDrawing(cellData) {
    const { canvas, ctx } = cellData;

    const start = (e) => {

cellData.isTap = true;

	// If we're in "alphabet paste" mode, don't draw — let click handler run

	// If alphabet mode, do NOT draw and do NOT trigger OCR
  if (selectedLetter) {
    cellData.drawing = false;
    return;
  }
	
        if (cellData.recognized) return;
        e.preventDefault();
        cellData.drawing = true;
        const pos = getPos(canvas, e);
        cellData.lastX = pos.x;
        cellData.lastY = pos.y;
        clearTimeout(cellData.timer);
    };

    const move = (e) => {

	
        if (!cellData.drawing || cellData.recognized) return;

	  // Movement detected → this is a stroke, not a tap
  cellData.isTap = false;

        e.preventDefault();
        const pos = getPos(canvas, e);
        ctx.beginPath();
        ctx.moveTo(cellData.lastX, cellData.lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        cellData.lastX = pos.x;
        cellData.lastY = pos.y;
    };

    const end = () => {

	// If alphabet mode, do NOT trigger OCR
  if (selectedLetter) return;

	// If it was a tap, let click handler run
	if (cellData.isTap) return;
	
        if (!cellData.drawing) return;
        cellData.drawing = false;
        clearTimeout(cellData.timer);
        cellData.timer = setTimeout(() => recognizeCell(cellData), inactivityDelay);
    };

    canvas.onmousedown = start;
    canvas.onmousemove = move;
    window.addEventListener('mouseup', end);

    canvas.ontouchstart = start;
    canvas.ontouchmove = move;
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);
    
}// setupDrawing


async function recognizeCell(cellData) {
      if (selectedLetter) return;   // alphabet mode → skip OCR

    if (cellData.recognized) return;

    const { canvas } = cellData;
    const ctx = canvas.getContext('2d');
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Check for ink
    let hasInk = false;
    for (let i = 0; i < img.data.length; i += 4) {
        if (img.data[i] < 250 || img.data[i+1] < 250 || img.data[i+2] < 250) {
            hasInk = true;
            break;
        }
    }
    if (!hasInk) return;

    statusEl.textContent = 'Recognizing letter...';
    showSpinner();

    try {
        const processed = preprocessForOCR(canvas);

        const result = await Tesseract.recognize(
            processed,
            'eng',
            { tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
	      classify_enable_learning: 1,
              classify_enable_adaptive_matcher: 1,
              tessedit_enable_dict: 1
	    }
        );

/*
        // Extract symbol data
        const symbols = result.data.symbols;
        const sym = symbols && symbols[0];

	console.log("SYMBOL:", sym);
	console.log("CHOICES:", sym.choices);
	console.log("ALTERNATES:", sym.alternates);
	console.log("PROPERTIES:", sym.properties);
*/
	const symbols = result.data.symbols;
const sym = symbols && symbols[0];

//console.log("SYMBOL:", sym);

if (!sym) {
    showAlertWithDrawing(canvas);
    statusEl.textContent = 'Could not recognize.';
    clearCell(cellData);
    return;
}

//console.log("CHOICES:", sym.choices || []);
//console.log("ALTERNATES:", sym.alternates || []);
//console.log("PROPERTIES:", sym.properties || {});

        if (!sym) {
            showAlertWithDrawing(canvas);
            statusEl.textContent = 'Could not recognize.';
            clearCell(cellData);
            return;
        }

        // Primary guess
        const primary = sym.text.toUpperCase();
	
	if (!/^[A-Z]$/.test(primary)) {
            showAlertWithDrawing(canvas);
            statusEl.textContent = 'Only letters allowed.';
            clearCell(cellData);
            return;
        }
	
	
        // Alternate guesses
        let alternatives = [];
        if (sym.choices && sym.choices.length > 1) {
            alternatives = sym.choices
                .map(c => ({
                    letter: c.text.toUpperCase(),
                    conf: c.confidence
                }))
                .filter(c => /^[A-Z]$/.test(c.letter));
        }

        // Display guesses in status bar
        showAlternateGuesses(primary, alternatives);

        // Apply letter to grid + key
        placeLetter(cellData, primary, false);
        propagateLetter(cellData.number, primary);

        cellData.recognized = true;

    } catch (err) {
        console.error(err);
        showAlertWithDrawing(canvas);
        statusEl.textContent = 'Error during recognition.';
        clearCell(cellData);

    } finally {
        hideSpinner();
    }
}

function showAlternateGuesses(primary, alternatives) {
    if (!alternatives || alternatives.length === 0) {
        statusEl.textContent = `Recognized: ${primary}`;
        return;
    }

    // Format: A (92%), H (40%), R (22%)
    const guessList = alternatives
        .slice(0, 3)
        .map(c => `${c.letter} (${Math.round(c.conf)}%)`)
        .join(', ');

    statusEl.textContent = `Recognized: ${primary}. Other guesses: ${guessList}`;
}

function placeLetter(cellData, letter, isStarter) {
    const { cell, number } = cellData;
    cell.innerHTML = '';

    const numberLabel = document.createElement('div');
    numberLabel.className = 'number-label';
    numberLabel.textContent = number;
    cell.appendChild(numberLabel);

    const letterDiv = document.createElement('div');
    letterDiv.className = 'letter';
    if (isStarter) letterDiv.classList.add('starter');
    letterDiv.textContent = letter;
    cell.appendChild(letterDiv);

      // ⭐ Reattach click-to-fill after DOM rewrite
//    attachAlphabetClickFill(cellData);
    
}//placeLetter


function createKeyRows() {
    for (let i = 1; i <= 13; i++) {
        const cd = createCell(i);
        keyTop.appendChild(cd.cell);
    }
    for (let i = 14; i <= 26; i++) {
        const cd = createCell(i);
        keyBottom.appendChild(cd.cell);
    }
}//createKeyRows

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
  kt.style.left = (wrapper.offsetWidth - kt.offsetWidth - 50) + "px";

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
  kb.style.left = (wrapper.offsetWidth - kb.offsetWidth -10) + "px";

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


function checkAnswers() {
      cells.forEach(cd => {
        if (!cd.recognized || cd.starter) return;

        const letterDiv = cd.cell.querySelector('.letter');
        if (!letterDiv) return;

        const correct = solutionMap[cd.number];
        const typed = letterDiv.textContent.toUpperCase();

        if (typed !== correct) {
          letterDiv.classList.add('wrong');
        } else {
          letterDiv.classList.remove('wrong');
        }
      });
    }

function showAlertWithDrawing(canvas) {
  // Convert drawing to image
  const dataURL = canvas.toDataURL();

    positionAlert();   // <--- NEW
    
  // Insert image into alert
  alertEl.innerHTML = `
    LETTER NOT RECOGNIZED — TRY AGAIN
    <div style="margin-top:6px;">
      <img src="${dataURL}" style="width:40px;height:40px;object-fit:contain;border:1px solid #fff;padding:2px;background:#0002;border-radius:4px;">
    </div>
  `;

    // Show alert
    alertEl.style.display = "block";
    alertEl.style.opacity = "1";

    // Fade out
    setTimeout(() => {
	alertEl.style.transition = "opacity 0.8s";
	alertEl.style.opacity = "0";
	setTimeout(() => {
	    alertEl.style.display = "none";
	    alertEl.style.transition = "";
	    alertEl.innerHTML = "LETTER NOT RECOGNIZED — TRY AGAIN"; // reset
	}, 800);
    }, 2000);
}//showAlertWithDrawing


checkBtn.addEventListener('click', checkAnswers);


//loadPuzzle(1);
//loadPuzzle(Math.floor(Math.random() * totalPuzzles) + 1); // random version

//createGrid();
//createKeyRows();


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


function positionCheckButton() {
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
}

window.addEventListener("resize", positionCheckButton);
positionCheckButton();

function showSpinner() {
  document.getElementById("ocrSpinner").style.display = "inline-block";
}

function hideSpinner() {
  document.getElementById("ocrSpinner").style.display = "none";
}

function fillAllAnswers() {

    for (const cellData of cells) {
        if (cellData.number && !cellData.isBlack) {

            const correctLetter = solutionMap[cellData.number];
            if (!correctLetter) continue;

            // Is this number one of the hints?
            const isStarter = hintPairs.some(h => h.number === cellData.number);

            // Do NOT overwrite hint cells
            if (cellData.starter) continue;

            // Fill grid cell
            placeLetter(cellData, correctLetter, isStarter);
            cellData.recognized = true;
        }
    }

    statusEl.textContent = "All answers filled.";

    // Fill the answer key
    const keyCells = [...keyTop.children, ...keyBottom.children];
    
    keyCells.forEach(div => {
	const num = parseInt(div.querySelector('.number-label').textContent);
	if (num > 0) {
            const correctLetter = solutionMap[num];
            if (correctLetter) {
		const isStarter = hintPairs.some(h => h.number === num);
		div.innerHTML = `
                <div class="number-label">${num}</div>
                <div class="letter ${isStarter ? 'starter' : ''}">${correctLetter}</div>
            `;
//was                <div class="letter starter">${correctLetter}</div>
            }
	}
    });
    
}//fillAllAnswers

document.getElementById("fillAllBtn").addEventListener("click", fillAllAnswers);

function propagateLetter(number, letter, isStarter = false) {
    // Fill all grid cells with this number
    cells.forEach(cd => {
	if (cd.number === number && !cd.starter) {
	    placeLetter(cd, letter,  isStarter);
	    cd.recognized = true;
	}
    });
    
    // Fill all key cells with this number
    const keyCells = [...keyTop.children, ...keyBottom.children];
    keyCells.forEach(div => {
	const num = parseInt(div.querySelector('.number-label').textContent);
	if (num === number) {
	    div.innerHTML = `
        <div class="number-label">${num}</div>
        <div class="letter ${isStarter ? 'starter' : ''}">${letter}</div>
      `;
//was        <div class="letter starter">${letter}</div>

	}
    });
    
    markAlphabetUsed(letter);
    
}//propagateLetter

function propagateClear(number) {

    handleAlphabetAfterClear(number);

    // Clear all grid cells with this number
    cells.forEach(cd => {
	if (cd.number === number && !cd.starter) {

	    // ⭐ ALWAYS reset starter
            cd.starter = false;
	    
	    clearCell(cd);
	    cd.recognized = false;
	}
    });

    // Clear all key cells with this number
    const keyCells = [...keyTop.children, ...keyBottom.children];
    keyCells.forEach(div => {
	const num = parseInt(div.querySelector('.number-label').textContent);
	if (num === number) {
	    div.innerHTML = `
        <div class="number-label">${num}</div>
      `;
	}
    });


}//propagateClear

function handleAlphabetAfterClear(number) {
    let letter = null;

    // Look for the letter in the key bars
    const keyCells = [...keyTop.children, ...keyBottom.children];
    keyCells.forEach(div => {
        const num = parseInt(div.querySelector('.number-label').textContent);

        if (num === number) {
            const letterDiv = div.querySelector('.letter');
            if (letterDiv) {
                letter = letterDiv.textContent.trim().toUpperCase();
            }
        }
    });

    // If we found a letter, uncross it
    if (letter) {
        markAlphabetUnused(letter);
    }
}

/*
function propagateClear(number) {
  let clearedLetter = null;

  // Clear all grid cells with this number
  cells.forEach(cd => {
    if (cd.number === number && !cd.starter) {
      if (cd.recognizedLetter) clearedLetter = cd.recognizedLetter;
      clearCell(cd);
      cd.recognized = false;
      cd.recognizedLetter = null;
    }
  });

  // Clear key cells
  const keyCells = [...keyTop.children, ...keyBottom.children];
  keyCells.forEach(div => {
    const num = parseInt(div.querySelector('.number-label').textContent);
    if (num === number) {
      div.innerHTML = `<div class="number-label">${num}</div>`;
    }
  });

  // If we know which letter was cleared, uncross it
  if (clearedLetter) {
    markAlphabetUnused(clearedLetter.toUpperCase());
  }
}
*/
function preprocessForOCR(canvas) {
  const temp = document.createElement("canvas");
  temp.width = 100;
  temp.height = 100;
  const tctx = temp.getContext("2d");

  // Draw original
  tctx.drawImage(canvas, 0, 0);

  // Increase contrast
  const img = tctx.getImageData(0, 0, 100, 100);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = data[i] < 200 ? 0 : 255;
    data[i] = data[i+1] = data[i+2] = v;
  }
  tctx.putImageData(img, 0, 0);

  return temp;
}//preprocessForOCR


function buildAlphabetBar() {
  const bar = document.getElementById('alphabetBar');
  bar.innerHTML = '';

    // ⭐ Move the alphabet bar in JS
  bar.style.position = "absolute";
  bar.style.right = "-80px";          // distance from right edge
//  bar.style.top = "50%";             // vertical center
//  bar.style.transform = "translateY(-50%)";
  bar.style.display = "grid";
  bar.style.gridTemplateColumns = "40px";  // one letter per row
  bar.style.gridAutoRows = "40px";
    bar.style.gap = "4px";
bar.style.gridTemplateColumns = "40px 40px";
//bar.style.top = "45px";
bar.style.transform = "none";
    bar.style.top = (45 + keyTop.offsetHeight + 20) + "px";

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  alphabet.forEach(letter => {
    const div = document.createElement('div');
    div.className = 'alpha-letter';
    div.dataset.letter = letter;
    div.textContent = letter;

    // NEW: click to select
    div.addEventListener('click', () => {
      document.querySelectorAll('.alpha-letter').forEach(el => 
        el.classList.remove('selected')
      );

      div.classList.add('selected');
      selectedLetter = letter;
    });

    bar.appendChild(div);
  });
}

function markAlphabetUsed(letter) {
  const div = document.querySelector(`.alpha-letter[data-letter="${letter}"]`);
  if (div) div.classList.add('used');
}

function markAlphabetUnused(letter) {

    const div = document.querySelector(`.alpha-letter[data-letter="${letter}"]`);

    if (div) div.classList.remove('used');
}

function isLetterStillUsed(letter) {
  return cells.some(cd =>
    cd.recognized &&
    solutionMap[cd.number] === letter
  );
}

function drawJoiner(cellA, cellB) {
    const rectA = cellA.getBoundingClientRect();
    const rectB = cellB.getBoundingClientRect();
    const wrapperRect = gridWrapperJoiner.getBoundingClientRect();

    const x1 = rectA.left + rectA.width / 2 - wrapperRect.left;
    const y1 = rectA.top + rectA.height / 2 - wrapperRect.top;
    const x2 = rectB.left + rectB.width / 2 - wrapperRect.left;
    const y2 = rectB.top + rectB.height / 2 - wrapperRect.top;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    const div = document.createElement('div');
    div.className = 'joiner';
    div.style.width = `${length}px`;
    div.style.height = `4px`;        // thickness
    div.style.left = `${x1}px`;
    div.style.top = `${y1 - 2}px`;   // center vertically
    div.style.transform = `rotate(${angle}deg)`;
    div.style.transformOrigin = '0 50%';

    joinerLayer.appendChild(div);
}

// **** load the puzzle selected ***

function loadPuzzle(id) {
//    populatePuzzleSelector();
//    document.getElementById('puzzleSelector').value = "1";
//    loadPuzzle(1);

    const puzzle = PUZZLES[id];
    if (!puzzle) {
	console.error("Puzzle not found:", id);
	return;
    }

    
    gridNumbers = puzzle.grid;
    solutionMap = puzzle.solution;
    hintPairs = puzzle.hints;

    // FULL RESET — clear everything from previous puzzle
    grid.innerHTML = "";
    keyTop.innerHTML = "";
    keyBottom.innerHTML = "";
    joinerLayer.innerHTML = "";
    
cells.length = 0;   // <-- THIS IS THE FIX
    
//    clearAlphabet();   // if you have this helper
//    cells = [];        // reset your cellData array
    createGrid();
    createKeyRows();

    //  buildGrid();
    applyStarters();
}


function populatePuzzleSelector() {
    const selector = document.getElementById('puzzleSelector');
    selector.innerHTML = '';

    for (const id in PUZZLES) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `Puzzle ${id}`;
        selector.appendChild(option);
    }
}

/*
document.getElementById('puzzleSelector').addEventListener('change', (e) => {
    const id = parseInt(e.target.value);
    loadPuzzle(id);
});
*/
/*
window.addEventListener("DOMContentLoaded", () => {
    populatePuzzleSelector();
    document.getElementById('puzzleSelector').value = "1";
    loadPuzzle(1);
});
*/

document.getElementById("puzzleInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const id = parseInt(e.target.value, 10);

    if (!id || !PUZZLES[id]) {
	alert(`That puzzle "${id}" number doesn't exist.`);
      return;
    }

    loadPuzzle(id);
  }
});

/*
// default 1
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("puzzleInput").value = 1;
  loadPuzzle(1);
  });
*/

window.addEventListener("DOMContentLoaded", async () => {
  await loadPuzzleData();          // load external file
  document.getElementById("puzzleInput").value = 1;
  loadPuzzle(1);                   // now safe to load
});

// *** help panel ***

function showDrawingHelp() {
    const panel = document.getElementById("helpPanel");
    panel.innerHTML = `
        <h3>Exact letter format</h3>
        <img src="help/letters.png">
    `;
    panel.classList.remove("hidden");
}

let helpInitialized = false;

document.getElementById("helpBtn").addEventListener("click", () => {
  const panel = document.getElementById("helpPanel");

  if (!helpInitialized) {
    showDrawingHelp();
      helpInitialized = true;
      return;
  }

  panel.classList.toggle("hidden");
});


document.getElementById("saveBtn").addEventListener("click", () => {
  html2canvas(document.querySelector(".wrapper"), {
    backgroundColor: "#ffffff",
    scale: 2
  }).then(canvas => {
    const dataURL = canvas.toDataURL("image/png");
    const parts = dataURL.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const binary = atob(parts[1]);
    let length = binary.length;
    const buffer = new Uint8Array(length);
    while (length--) buffer[length] = binary.charCodeAt(length);
    const blob = new Blob([buffer], { type: mime });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "puzzle.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
});

gridEl.addEventListener('click', (e) => {
  // No letter selected? Nothing to do.
  if (!selectedLetter) return;

  // Find the cell div that was clicked (canvas, letter, etc. all bubble up)
  const cellDiv = e.target.closest('.cell');
  if (!cellDiv) return;

  // Find the matching cellData
  const cellData = cells.find(cd => cd.cell === cellDiv);
  if (!cellData) return;

  // Don’t overwrite starters
  if (cellData.starter) return;

  // Paste the letter and propagate
  placeLetter(cellData, selectedLetter, false);
  propagateLetter(cellData.number, selectedLetter);
  cellData.recognized = true;

  // Clear alphabet selection
  document.querySelectorAll('.alpha-letter').forEach(el =>
    el.classList.remove('selected')
  );
  selectedLetter = null;
});


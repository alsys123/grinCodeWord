/* ------------------------------
   Main routine
   ------------------------------ */

let PUZZLES = {};   // will be filled from JSON
let selectedLetter = null;

let drawingEnabled = false;
let dictionaryLookupEnabled = false;

/*
  async function loadPuzzleData() {
  const response = await fetch("puzzleData.json");
  PUZZLES = await response.json();
  }
*/

let DICT = null;

async function loadDictionary() {
    const text = await fetch("websters/WebstersUnabridgedDictionaryVarious.txt")
        .then(r => r.text());

    DICT = text;
}

async function loadAllPuzzleSets() {
    const manifest = await fetch("data/manifest.json").then(r => r.json());

    PUZZLES = {};

    for (const file of manifest.files) {
	const data = await fetch("data/" + file).then(r => r.json());
	Object.assign(PUZZLES, data);
    }
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

function createCell(number,r,c) {
    const cell = document.createElement('div');
    cell.className = 'cell';

    /*
    // ⭐ Attach joiner events here
    cell.addEventListener("mousedown", onJoinStart);
    window.addEventListener("mouseup", onJoinEnd);
    cell.addEventListener("touchstart", onJoinStart);
    window.addEventListener("touchend", onJoinEnd);
    */   
    //    cell.addEventListener("click", () => handleJoinerTap(cellData));

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
    
    // add rows and column
    cellData.row = r;
    cellData.col = c;

    cell.addEventListener("click", () => handleJoinerTap(cellData));

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
	    
            const cd = createCell(num,r,c);
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

    
    // TEST JOINER
    //    const cellA = cells[23].cell;
    //    const cellB = cells[24].cell;
    //    drawJoiner(cellA, cellB);

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

    //    cLog("setupDrawing",joinerMode);   
    
    const { canvas, ctx } = cellData;

    // Canvas should NOT block joiner gestures by default
    //    canvas.style.pointerEvents = "none";
    
    const start = (e) => {

	//	cLog("at start of drawing");
	if (!drawingEnabled) return;   // ⭐ block drawing globally
	//	if (joinIsDragging) return;   // <-- prevents drawing during join gesture
	if (joinerMode) return;

	cellData.isTap = true;
	
	// If we're in "alphabet paste" mode, don't draw — let click handler run
	
	// If alphabet mode, do NOT draw and do NOT trigger OCR
	if (selectedLetter) {
	    cellData.drawing = false;
	    return;
	}
	
        if (cellData.recognized) return;

	// ⭐ Enable drawing mode: canvas must receive pointer events
        canvas.style.pointerEvents = "auto";
	
	e.preventDefault();
        cellData.drawing = true;
        const pos = getPos(canvas, e);
        cellData.lastX = pos.x;
        cellData.lastY = pos.y;
        clearTimeout(cellData.timer);
    };
    
    const move = (e) => {
	
	// ⭐ Block drawing during joiner mode
        if (joinerMode) return;

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


	let inactivityDelay = 1500; // 1.5 seconds
	clearTimeout(cellData.timer);
	cellData.timer = setTimeout(() => recognizeCell(cellData), inactivityDelay);

    };
    
    const end = () => {

	// ⭐ Block drawing during joiner mode
        if (joinerMode) return;
	
	// If alphabet mode, do NOT trigger OCR
	if (selectedLetter) return;
	
	// If it was a tap, let click handler run
	if (cellData.isTap) {

	    // ⭐ Disable canvas pointer events again
	    //??            canvas.style.pointerEvents = "none";
	    return;

	}
	
        if (!cellData.drawing) return;
        cellData.drawing = false;

	// ⭐ Disable canvas pointer events again
	//??        canvas.style.pointerEvents = "none";

        clearTimeout(cellData.timer);

	let inactivityDelay = 1500; // or whatever you currently use
        cellData.timer = setTimeout(() => recognizeCell(cellData), inactivityDelay);
    };

    /*
      canvas.onmousedown = start;
      canvas.onmousemove = move;
      window.addEventListener('mouseup', end);
      
      canvas.ontouchstart = start;
      canvas.ontouchmove = move;
      window.addEventListener('touchend', end);
      window.addEventListener('touchcancel', end);
    */
    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    
}// setupDrawing

// character OCR recognition main routine
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

	const result = await Tesseract.recognize(processed, 'eng', {
	    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
	    tessedit_ocr_engine_mode: 1,   // OEM_LSTM_ONLY
	    tessedit_pageseg_mode: 10     // Single character
	});

	const confidence = result.data.confidence;
	//	cLog(`Confidence: ${confidence}`);
	
        // Extract symbol data
        const symbols = result.data.symbols;
        const sym = symbols && symbols[0];

	//	cLog(sym,sym.choices,sym.alternates,sym.properties);
	//	
	//	console.log("SYMBOL:", sym);
	//	console.log("CHOICES:", sym.choices);
	//	console.log("ALTERNATES:", sym.alternates);
	//	console.log("PROPERTIES:", sym.properties);

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
	/*
          if (!sym) {
          showAlertWithDrawing(canvas);
          statusEl.textContent = 'Could not recognize.';
          clearCell(cellData);
          return;
          }
	*/
        // Primary guess
        let primary = sym.text.toUpperCase();
	
	//	cLog("Primary guess: ",primary);
	//autocorrect
	// future move to worker in utils
	if (confidence > 50){ 
	    if (primary === "0") primary = "O";
	    if (primary === "1") primary = "L";
	    if (primary === "|") primary = "I";
	    if (primary === "/") primary = "I";
	    //	    if (primary == "(" ) primary = "L";
	    if (primary === "\\" ) primary = "L";
	    if (primary === "{" ) primary = "L";
	    if (primary === "5") primary = "S";   // 5 → S
	    if (primary === "2") primary = "Z";   // 2 → Z
	    if (primary === "8") primary = "B";   // 8 → B (rare but happens)
	    if (primary === "S") primary = "S";   // normalize lowercase s
	    if (primary === "(") primary = "C";   // open paren → C
	    if (primary === ")") primary = "C";   // close paren → C
	    if (primary === "{") primary = "C";   // curly brace → C
	    if (primary === "}") primary = "C";   // curly brace → C
	    if (primary === "[") primary = "C";   // bracket → C
	    if (primary === "]") primary = "C";   // bracket → C
	}
	
	if (!/^[A-Z]$/.test(primary)) {
            showAlertWithDrawing(canvas);
            statusEl.textContent =
		`Only letters allowed. Found: ${primary} with ${confidence}% condidence`;
            clearCell(cellData);
            return;
        }
	
	
        // Alternate guesses
        let alternatives = [];
        if (sym.choices && sym.choices.length > 1) {

	    cLog("Found alernatives!");
	    
            alternatives = sym.choices
                .map(c => ({
                    letter: c.text.toUpperCase(),
                    conf: c.confidence
                }))
                .filter(c => /^[A-Z]$/.test(c.letter));
        }

        // Display guesses in status bar
        showAlternateGuesses(primary, confidence, alternatives);
	
        // Apply letter to grid + key
        placeLetter(cellData, primary, false);
        propagateLetter(cellData.number, primary);

        cellData.recognized = true;

    } catch (err) {
        console.error(err);
        showAlertWithDrawing(canvas);
        statusEl.textContent = `Error during recognition. ERROR: ${err}`;
        clearCell(cellData);

    } finally {
        hideSpinner();
    }
}// recognizeCell

function showAlternateGuesses(primary, confidence, alternatives) {
    if (!alternatives || alternatives.length === 0) {
        statusEl.textContent =
	    `Recognized: ${primary} with ${confidence}% condidence`;
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
    bar.style.right = "0px";          // distance from right edge
    //  bar.style.top = "50%";             // vertical center
    //  bar.style.transform = "translateY(-50%)";
    bar.style.display = "grid";
    //    bar.style.gridTemplateColumns = "40px";  // one letter per row
    bar.style.gridTemplateColumns = "40px 40px";
    bar.style.gridAutoRows = "40px";
    bar.style.gap = "4px";
    //    bar.style.gridAutoFlow = "column";            // ⭐ fill top-to-bottom
    //    bar.style.gridTemplateColumns = "40px 40px";
    //bar.style.top = "45px";
    bar.style.transform = "none";
    bar.style.top = (45 + keyTop.offsetHeight + 20) + "px";

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    // sort the letters
    const cols = 2;
    const rows = Math.ceil(alphabet.length / cols);
    const ordered = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const idx = r + c * rows;
            if (idx < alphabet.length) {
                ordered.push(alphabet[idx]);
            }
        }
    }
    
    //    alphabet.forEach(letter => {
    ordered.forEach(letter => {
	const div = document.createElement('div');
	div.className = 'alpha-letter';
	div.dataset.letter = letter;
	div.textContent = letter;

	// NEW: click to select
	div.addEventListener('click', () => {

	    // ⭐ Block alphabet selection while joiner tool is active
	    if (joinerMode) return;
	    
	    document.querySelectorAll('.alpha-letter').forEach(el => 
		el.classList.remove('selected')
	    );

	    div.classList.add('selected');
	    selectedLetter = letter;
	});

	bar.appendChild(div);
    });
}//buildAlphabetBar

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
    hintPairs   = puzzle.hints;

    // FULL RESET — clear everything from previous puzzle
    grid.innerHTML        = "";
    keyTop.innerHTML      = "";
    keyBottom.innerHTML   = "";
    joinerLayer.innerHTML = "";
    
    cells.length = 0;   // <-- THIS IS THE FIX
    
    //    clearAlphabet();   // if you have this helper
    //    cells = [];        // reset your cellData array
    createGrid();
    createKeyRows();

    //  buildGrid();
    applyStarters();

    dei("puzzleTitle").textContent = `Codeword Handwriting Puzzle — #${id}`;
    // update navigation buttons
    updatePuzzleNavButtons(id);
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
  const puzzleInput = document.getElementById("puzzleInput");


  puzzleInput.addEventListener("input", e => {
  const id = parseInt(e.target.value, 10);

  if (!id) return;            // ignore empty or invalid
  if (!PUZZLES[id]) return;   // ignore numbers that don't exist

  loadPuzzle(id);
  });
*/

const puzzleInput = document.getElementById("puzzleInput");
let puzzleLoadTimer = null;

puzzleInput.addEventListener("input", e => {
    clearTimeout(puzzleLoadTimer);

    puzzleLoadTimer = setTimeout(() => {
	const id = parseInt(e.target.value, 10);
	if (id && PUZZLES[id]) loadPuzzle(id);
    }, 150);
});

/*
// default 1
window.addEventListener("DOMContentLoaded", () => {
document.getElementById("puzzleInput").value = 1;
loadPuzzle(1);
});
*/

window.addEventListener("DOMContentLoaded", async () => {
    //    await loadPuzzleData();          // load external file
    await loadAllPuzzleSets();

    await loadDictionary();   // ⭐ load dictionary here

    document.getElementById("puzzleInput").value = 1;
    loadPuzzle(1);                   // now safe to load
});

// *** help panel ***

/*
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

*/

document.getElementById("saveBtn").addEventListener("click", () => {

    // Hide unwanted UI
    const checkBtn   = dei("checkBtn");
    const fillAllBtn = dei("fillAllBtn");
    checkBtn.style.display = "none";
    fillAllBtn.style.display = "none";

    //    const wrapper = document.querySelector(".wrapper");
    //    const alphabetBar = dei("alphabetBar");
    // temporarily move it
    //    wrapper.appendChild(alphabetBar);
    
    html2canvas(document.querySelector(".wrapper"), {
	backgroundColor: "#ffffff",
	scale: 2
    }).then(canvas => {

	// Restore UI
	checkBtn.style.display = "";
	fillAllBtn.style.display = "";

	// move it back
	//      document.body.appendChild(alphabetBar);
	
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

    checkDictionaryLookup(e);
    
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


// *** Previous Next Button
//const puzzleInput = document.getElementById("puzzleInput");
const prevBtn = document.getElementById("prevPuzzle");
const nextBtn = document.getElementById("nextPuzzle");

function loadPuzzleIfExists(id) {
    if (PUZZLES[id]) {
	puzzleInput.value = id;
	loadPuzzle(id);
    }
}

prevBtn.addEventListener("click", () => {
    const id = parseInt(puzzleInput.value || "1", 10);
    loadPuzzleIfExists(id - 1);
});

nextBtn.addEventListener("click", () => {
    const id = parseInt(puzzleInput.value || "1", 10);
    loadPuzzleIfExists(id + 1);
});

// see whether the buttons should be enabled/disabled
function updatePuzzleNavButtons(currentId) {
    const prevBtn = document.getElementById("prevPuzzle");
    const nextBtn = document.getElementById("nextPuzzle");

    const maxPuzzle = Math.max(...Object.keys(PUZZLES).map(Number));

    prevBtn.disabled = currentId <= 1;
    nextBtn.disabled = currentId >= maxPuzzle;
}


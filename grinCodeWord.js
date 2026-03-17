  /* ------------------------------
   Main routine
   ------------------------------ */

const rows = 13;
    const cols = 13;
    const inactivityDelay = 1200; // Slightly faster recognition

    const gridEl = document.getElementById('grid');
    const keyTop = document.getElementById('keyTop');
    const keyBottom = document.getElementById('keyBottom');
    const statusEl = document.getElementById('status');
    const alertEl = document.getElementById('alert');
    const hintEl = document.getElementById('hintText');
    const checkBtn = document.getElementById('checkBtn');

/*
    const gridNumbers = [
      [0,5,12,8,0,3,19,3,0,8,12,5,0],
      [7,0,21,0,14,0,9,0,14,0,21,0,7],
      [10,18,0,4,0,22,1,22,0,4,0,18,10],
      [0,0,16,0,11,0,6,0,11,0,16,0,0],
      [2,15,0,23,0,13,25,13,0,23,0,15,2],
      [9,0,20,0,17,0,24,0,17,0,20,0,9],
      [0,6,1,11,25,24,26,24,25,11,1,6,0],
      [9,0,20,0,17,0,24,0,17,0,20,0,9],
      [2,15,0,23,0,13,25,13,0,23,0,15,2],
      [0,0,16,0,11,0,6,0,11,0,16,0,0],
      [10,18,0,4,0,22,1,22,0,4,0,18,10],
      [7,0,21,0,14,0,9,0,14,0,21,0,7],
      [0,5,12,8,0,3,19,3,0,8,12,5,0]
    ];

    const solutionMap = {
      1:'E',2:'R',3:'O',4:'N',5:'S',6:'L',7:'C',8:'D',9:'I',10:'H',
      11:'T',12:'A',13:'U',14:'P',15:'M',16:'G',17:'Y',18:'B',19:'K',
      20:'F',21:'W',22:'V',23:'J',24:'Q',25:'X',26:'Z'
    };

    const hintPairs = [
      { number: 3, letter: "O" },
      { number: 19, letter: "K" }
    ];
*/
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

      return cellData;
    }

    function createGrid() {
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
    }

function applyStarters() {
    hintPairs.forEach(h => {
        const target = cells.find(cd => cd.number === h.number && !cd.starter);
        if (target) {
            placeLetter(target, h.letter, true);
            target.starter = true;
            target.recognized = true;
        }
    });

    hintEl.textContent = `Hints: ${hintPairs[0].number} = ${hintPairs[0].letter}   ${hintPairs[1].number} = ${hintPairs[1].letter}`;
} //applyStarters


    function setupDoubleTap(cellData) {
      const handler = () => {
        const now = Date.now();
        if (now - cellData.lastTap < 280) {
          if (cellData.recognized && !cellData.starter) {
            clearCell(cellData);
          }
        }
        cellData.lastTap = now;
      };

      cellData.cell.addEventListener('touchend', handler);
      cellData.cell.addEventListener('click', handler);
    }

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
    }

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
    }


async function recognizeCell(cellData) {
      if (cellData.recognized) return;

      const { canvas } = cellData;
      const ctx = canvas.getContext('2d');
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let hasInk = false;
      for (let i = 0; i < img.data.length; i += 4) {
        if (img.data[i] < 250 || img.data[i+1] < 250 || img.data[i+2] < 250) {
          hasInk = true;
          break;
        }
      }
      if (!hasInk) return;

      statusEl.textContent = 'Recognizing letter...';

    showSpinner();   // <--- NEW
    
      try {
        const result = await Tesseract.recognize(canvas, 'eng', {
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        });

        let text = (result.data.text || '').trim();
        if (text.length > 1) text = text[0];
        if (!text) {
//          showAlert();
	    showAlertWithDrawing(canvas);
            statusEl.textContent = 'Could not recognize.';
	    clearCell(cellData);   // <-- add this
	    
          return;
        }

        const letter = text.toUpperCase();
        if (!/^[A-Z]$/.test(letter)) {
 //         showAlert();
	    showAlertWithDrawing(canvas);
            statusEl.textContent = 'Only letters allowed.';
	    clearCell(cellData);   // <-- add this
	    
          return;
        }

          placeLetter(cellData, letter, false);
          cellData.recognized = true;
          statusEl.textContent = `Recognized: "${letter}"`;
	  
      } catch (err) {
          console.error(err);
//          showAlert();
	  showAlertWithDrawing(canvas);
          statusEl.textContent = 'Error during recognition.';
	  clearCell(cellData);   // <-- add this
	        
      } finally {
	  hideSpinner();   // <--- NEW
      }
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
    }


    function createKeyRows() {
      for (let i = 1; i <= 13; i++) {
        const cd = createCell(i);
        keyTop.appendChild(cd.cell);
      }
      for (let i = 14; i <= 26; i++) {
        const cd = createCell(i);
        keyBottom.appendChild(cd.cell);
      }
    }

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
  kt.style.left = (wrapper.offsetWidth - kt.offsetWidth - 30) + "px";

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
  kb.style.left = (wrapper.offsetWidth - kb.offsetWidth +10) + "px";

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

    createGrid();
    createKeyRows();
 
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
	if (cellData.number && !cellData.isBlack && !cellData.starter) {
	    //    if (cellData.number && !cellData.isBlack) {
	    const correctLetter = solutionMap[cellData.number];
	    if (correctLetter) {
		placeLetter(cellData, correctLetter, true);
		cellData.recognized = true;
	    }
	}
    }
    
    statusEl.textContent = "All answers filled.";
}//fillAllAnswers

document.getElementById("fillAllBtn").addEventListener("click", fillAllAnswers);

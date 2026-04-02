
 /* ------------------------------
   DICTIONARY
   ------------------------------ */

function getHorizontalWord(cellData) {
    const row = cellData.row;
    const col = cellData.col;

    // Move left until you hit a black cell or edge
    let c = col;
    while (c > 0 && gridNumbers[row][c - 1] !== 0) {
        c--;
    }

    // Now collect letters moving right
    let word = "";
    let positions = [];

    while (c < cols && gridNumbers[row][c] !== 0) {
        const cd = cells.find(x => x.row === row && x.col === c);
        const letter = cd && cd.cell.querySelector(".letter")?.textContent || "_";

        word += letter;
        positions.push(cd);

        c++;
    }

    return { word, positions };
}


function getVerticalWord(cellData) {
    const row = cellData.row;
    const col = cellData.col;

    // Move up
    let r = row;
    while (r > 0 && gridNumbers[r - 1][col] !== 0) {
        r--;
    }

    // Collect letters moving down
    let word = "";
    let positions = [];

    while (r < rows && gridNumbers[r][col] !== 0) {
        const cd = cells.find(x => x.row === r && x.col === col);
        const letter = cd && cd.cell.querySelector(".letter")?.textContent || "_";

        word += letter;
        positions.push(cd);

        r++;
    }

    return { word, positions };
}

function checkDictionaryLookup(e) {
    if (!dictionaryLookupEnabled) return;

    const cellDiv = e.target.closest('.cell');
    if (!cellDiv) return;

    const cellData = cells.find(cd => cd.cell === cellDiv);
    if (!cellData) return;

    // Get both words
    const horiz = getHorizontalWord(cellData);
    const vert  = getVerticalWord(cellData);

    clearDictionaryHighlights(); //clear all the old ones
    
    // ⭐ Highlight both words
    highlightCells(horiz.positions);
    highlightCells(vert.positions);

    // Choose whichever is longer (or show both)
    const best = horiz.word.length >= vert.word.length ? horiz : vert;

//    lookupDictionary(best.word);
    lookupDictionary(horiz.word,vert.word);
}

function lookupDictionary(horizWord,vertWord) {
//    cLog("Looking up (Horizonal): " + horizWord);
//    cLog("Looking up (Vertical) : " + vertWord);

    defH = lookupADictionary(horizWord);
    defV = lookupADictionary(vertWord);
    showDictionaryPopup(horizWord, defH, vertWord, defV);
}


function lookupADictionary(word) {
//    if (!DICT) {
//        alert("Dictionary not loaded yet.");
//        return;
//    }
    let def = "";

    if (!DICT) return "";

    // If it's a single character, skip lookup
    if (!word || word.length === 1 || word.includes("_")) {
        return "";
    }

    // Word must be uppercase
    const target = `\n${word}\n`;

    const start = DICT.indexOf(target);
    if (start === -1) {
	//        alert(`No dictionary entry found for: ${word}`);
	def = "No Definition Found!";
        return def;
    }

    // Find next ALL CAPS word
    const rest = DICT.slice(start + target.length);

    const nextMatch = rest.search(/\n[A-Z][A-Z0-9\- ]+\n/);

    let entry = "";
    if (nextMatch === -1) {
        entry = rest; // last entry in file
    } else {
        entry = rest.slice(0, nextMatch);
    }

    //    showDictionaryPopup(word, entry.trim());
    def = entry.trim();
    return def;
    
}

function showDictionaryPopup(wordH, defH, wordV, defV) {
    if (defH === "") wordH = "";
    if (defV === "") wordV = "";

    // Replace blank lines with <br>
    const cleanH = defH.replace(/^\s*$/gm, "<br>");
    const cleanV = defV.replace(/^\s*$/gm, "<br>");
    
    const panel = document.getElementById("dictionaryPanel");
    const content = document.getElementById("dictionaryContent");

    content.innerHTML = `
        <h2>Dictionary Lookup</h2>
        <h3>Webster's Unabridged Dictionary</h3>
        <h4>${wordH}</h4>
        <p>${cleanH}</p>
        <br><br>
        <h4>${wordV}</h4>
        <p>${cleanV}</p>
    `;

    panel.classList.remove("hidden");
}

document.getElementById("dictCloseBtn").addEventListener("click", () => {
    document.getElementById("dictionaryPanel").classList.add("hidden");
    clearDictionaryHighlights(); //clear all the old ones

});

function makeDictionaryPopupDraggable() {
    const panel = document.getElementById("dictionaryPanel");
    const handle = document.getElementById("dictDragHandle");

    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    handle.addEventListener("mousedown", (e) => {
        isDragging = true;

        // Remove centering transform so dragging works naturally
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
}

function clearDictionaryHighlights() {
    document.querySelectorAll(".dict-highlight").forEach(el =>
        el.classList.remove("dict-highlight")
    );
}

function highlightCells(cellList) {
    cellList.forEach(cd => {
        cd.cell.classList.add("dict-highlight");
    });
}

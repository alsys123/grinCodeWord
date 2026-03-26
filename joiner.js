 /* ------------------------------
   CellJoiner -- joining two cells
   ------------------------------ */

let joinerMode = false;
let joinStartCell = null;
let joiners = [];  // array of {a:number, b:number, element:div}

document.getElementById("joinerBtn").addEventListener("click", () => {
    joinerMode = !joinerMode;

    joinStartCell = null; // reset any partial selection

    document.getElementById("joinerBtn").classList.toggle("active", joinerMode);

//    console.log("Joiner mode:", joinerMode);
});

function handleJoinerTap(cellData) {
//    cLog("handleJoinerTap");
    
    if (!joinerMode) return;

    // First tap → select start cell
    if (!joinStartCell) {
        joinStartCell = cellData;
        highlightCell(cellData.cell);
        return;
    }

    // Second tap → attempt join
    const start = joinStartCell;
    const end = cellData;

    clearHighlight(start.cell);

    // Reset for next join
    joinStartCell = null;

    // Same cell → ignore
    if (start === end) return;

    // Only vertical or horizontal
    if (!areCellsAligned(start, end)) return;

    // Toggle joiner: if exists → remove, else → add
    if (joinerExists(start, end)) {
        removeJoiner(start, end);
    } else {
        drawJoiner(start.cell, end.cell);
        storeJoiner(start, end);
    }
}

function highlightCell(cell) {
    cell.classList.add("joiner-selected");
}

function clearHighlight(cell) {
    cell.classList.remove("joiner-selected");
}

function storeJoiner(a, b) {
    joiners.push({ a: a.number, b: b.number, element: joinerLayer.lastChild });
}

function joinerExists(a, b) {
//    cLog("joinerExists");
    
    return joiners.some(j =>
        (j.a === a.number && j.b === b.number) ||
        (j.a === b.number && j.b === a.number)
    );
}

function removeJoiner(a, b) {
    const idx = joiners.findIndex(j =>
        (j.a === a.number && j.b === b.number) ||
        (j.a === b.number && j.b === a.number)
    );

    if (idx >= 0) {
        joinerLayer.removeChild(joiners[idx].element);
        joiners.splice(idx, 1);
    }
}


function areCellsAligned(a, b) {
    
//    cLog("areCellsAligned",a,b);
    
    //    cLog("cells:",cells);
    const aligned = (a.row === b.row || a.col === b.col);
    
//    cLog("aligned? ",aligned);
    
    return aligned;
}
/*
function drawJoiner(cellA, cellB) {

//    cLog("draw joiner",cellA,cellB);

    const rectA = cellA.getBoundingClientRect();
    const rectB = cellB.getBoundingClientRect();
    const wrapperRect = gridWrapperJoiner.getBoundingClientRect();

    const x1 = rectA.left + rectA.width / 2 - wrapperRect.left;
    const y1 = rectA.top + rectA.height / 2 - wrapperRect.top;
    const x2 = rectB.left + rectB.width / 2 - wrapperRect.left;
    const y2 = rectB.top + rectB.height / 2 - wrapperRect.top;
   
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = (Math.sqrt(dx*dx + dy*dy)) * 0.5 ;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    const div = document.createElement('div');
    div.className = 'joiner';
    div.style.width = `${length}px`;
    div.style.height = `2px`;        // thickness
    div.style.left = `${x1}px`;
    div.style.top = `${y1 - 2}px`;   // center vertically
    div.style.transform = `rotate(${angle}deg)`;
    div.style.transformOrigin = '0 50%';

    joinerLayer.appendChild(div);

//    cLog("Completed the joiner Draw");
}
*/

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

    const fullLength = Math.sqrt(dx*dx + dy*dy);
    const halfLength = fullLength * 0.5;

    // ⭐ midpoint between A and B
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    // ⭐ angle stays the same
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    const div = document.createElement('div');
    div.className = 'joiner';

    // ⭐ draw half-length line centered at midpoint
    div.style.width = `${halfLength}px`;
    div.style.height = `2px`;
    div.style.left = `${mx}px`;
    div.style.top = `${my - 1}px`; // center vertically
    div.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    div.style.transformOrigin = '50% 50%';

    joinerLayer.appendChild(div);
}


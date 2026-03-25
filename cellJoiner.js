 /* ------------------------------
   CellJoiner -- joining two cells
   ------------------------------ */

let joinStartCell = null;
let joinPreview = null;
let joinIsDragging = false;

//cell.addEventListener("mousedown",  onJoinStart);
//cell.addEventListener("mouseup",    onJoinEnd);
//cell.addEventListener("touchstart", onJoinStart);
//cell.addEventListener("touchend",   onJoinEnd);

/*
function onJoinStart(e) {
  e.preventDefault();
  joinStartCell = e.currentTarget;   // the cell DOM element
}
*/

function onJoinStart(e) {

    cLog("on joiner Start");
    
    const cellDiv = e.currentTarget;
    const cellData = cells.find(cd => cd.cell === cellDiv);
    if (!cellData) return;

    joinStartCell = cellData;
    joinIsDragging = true;

    cLog("on joiner Start -- done");

}//onJoinStart
/*
function onJoinEnd(e) {

        cLog("on joiner END");

  if (!joinIsDragging || !joinStartCell) return;

    cLog("at1");
  joinIsDragging = false;

    // Find the element under the pointer
  const target = document.elementFromPoint(
    e.changedTouches ? e.changedTouches[0].clientX : e.clientX,
    e.changedTouches ? e.changedTouches[0].clientY : e.clientY
  );
    
    const cellDiv = e.currentTarget;
    const endCellData = cells.find(cd => cd.cell === cellDiv);
    
    if (!endCellData) return;
    
    cLog("at2", endCellData, joinStartCell);

  // Same cell → ignore
  if (endCellData === joinStartCell) {
    joinStartCell = null;
    return;
  }
    cLog("at3");

  // Only allow vertical or horizontal joins
  if (!areCellsAligned(joinStartCell, endCellData)) {
    joinStartCell = null;
    return;
  }
    cLog("at4");

  // Draw the joiner
  drawJoiner(joinStartCell.cell, endCellData.cell);

  joinStartCell = null;

    cLog("on joiner END -- done");

    }
*/

function onJoinEnd(e) {
    cLog("in End");
  if (!joinIsDragging || !joinStartCell) return;

  joinIsDragging = false;

  // Find the element under the pointer
  const target = document.elementFromPoint(
    e.changedTouches ? e.changedTouches[0].clientX : e.clientX,
    e.changedTouches ? e.changedTouches[0].clientY : e.clientY
  );

  const cellDiv = target.closest('.cell');
  if (!cellDiv) {
    joinStartCell = null;
    return;
  }

  const endCellData = cells.find(cd => cd.cell === cellDiv);
  if (!endCellData) return;

  // Same cell → ignore
  if (endCellData === joinStartCell) {
    joinStartCell = null;
    return;
  }

  // Only allow vertical or horizontal joins
  if (!areCellsAligned(joinStartCell, endCellData)) {
    joinStartCell = null;
    return;
  }

  drawJoiner(joinStartCell.cell, endCellData.cell);
    joinStartCell = null;

        cLog("in End -- done");

}

/*
function areCellsAligned(a, b) {
  const cols = GRID_COL_COUNT; // whatever your grid width is

  const rowA = Math.floor(a / cols);
  const colA = a % cols;

  const rowB = Math.floor(b / cols);
  const colB = b % cols;

  return rowA === rowB || colA === colB;
}
*/

function areCellsAligned(a, b) {
  const indexA = a.number - 1;
  const indexB = b.number - 1;

  const rowA = Math.floor(indexA / cols);
  const colA = indexA % cols;

  const rowB = Math.floor(indexB / cols);
  const colB = indexB % cols;

  return rowA === rowB || colA === colB;
}

function drawJoiner(cellA, cellB) {

    cLog("draw joiner");

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

    cLog("Completed the joiner Draw");
}

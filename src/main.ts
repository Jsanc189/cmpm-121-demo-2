import "./style.css";

const APP_NAME = "DecoDoodle";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME

const header = document.createElement("h1");
header.innerHTML = APP_NAME;
header.style.fontSize = "50px";
app.append(header);

const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
canvas.id = `canvas`;
app.appendChild(canvas);


const div = document.createElement('div');
div.style.height = '20px';
app.appendChild(div);

const drawingContext = canvas.getContext('2d');

const lines: Array<number> = [];
let currentLine = null;


const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = [];
  console.log(currentLine);
  lines.push(currentLine);
  

  canvas.dispatchEvent(drawingChangedEvent);
});

canvas.addEventListener('mousemove', (e) => {
    if (cursor.active) {
       cursor.x = e.offsetX;
       cursor.y = e.offsetY;
       currentLine.push({ x: cursor.x, y: cursor.y });
     }

     canvas.dispatchEvent(drawingChangedEvent);
});

canvas.addEventListener('mouseup', () => {
  cursor.active = false;
  currentLine = null;

  canvas.dispatchEvent(drawingChangedEvent);
});

const drawingChangedEvent = new Event('drawing-changed');

canvas.addEventListener('drawing-changed', () => {
    drawingContext.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lines) {
        if (line.length > 1) {
            drawingContext.beginPath();
            const { x, y } = line[0];
            drawingContext.moveTo(x, y);
            for (const { x, y } of line) {
                drawingContext.lineTo(x, y);
            }
            drawingContext.stroke();
        }
    }
});


function clearCanvas() {
    lines.splice(0, lines.length);
    canvas.dispatchEvent(drawingChangedEvent);
}


const clearButton = document.createElement('button');
clearButton.innerHTML = 'Clear';
clearButton.addEventListener('click', () => {
  clearCanvas();
});
app.appendChild(clearButton);

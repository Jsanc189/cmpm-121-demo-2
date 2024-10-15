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

const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
    if (cursor.active) {
       drawingContext.beginPath();
       drawingContext.moveTo(cursor.x, cursor.y);
       drawingContext.lineTo(e.offsetX, e.offsetY);
       drawingContext.stroke();
       cursor.x = e.offsetX;
       cursor.y = e.offsetY;
     }
});

canvas.addEventListener('mouseup', () => {
  cursor.active = false;
});

const clearButton = document.createElement('button');
clearButton.innerHTML = 'Clear';
clearButton.addEventListener('click', () => {
  drawingContext.clearRect(0, 0, canvas.width, canvas.height);
});
app.appendChild(clearButton);

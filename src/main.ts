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

const lines: Array<Line> = [];
const redoLines: Array<Line> = [];
let currentLine: Line | null = null;

const cursor = { active: false, x: 0, y: 0 };

interface Displayable {
    display(context: CanvasRenderingContext2D): void;
};

class Line implements Displayable {
    public points: Array<{ x: number; y: number }>;

    constructor() {
        this.points = [];
    }

    display(context: CanvasRenderingContext2D): void {
      if (this.points.length > 1) {
        context.beginPath();
        const { x, y } = this.points[0];
        context.moveTo(x, y);
        for (const { x, y } of this.points) {
          context.lineTo(x, y);
        }
        context.stroke();
      }
    }
} 

canvas.addEventListener('mousedown', (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = new Line();
  currentLine.points.push({ x: cursor.x, y: cursor.y });
  lines.push(currentLine);
  
  canvas.dispatchEvent(drawingChangedEvent);
});

canvas.addEventListener('mousemove', (e) => {
    if (cursor.active && currentLine) {
       cursor.x = e.offsetX;
       cursor.y = e.offsetY;
       currentLine.points.push({ x: cursor.x, y: cursor.y });
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
        line.display(drawingContext);
    }
});

interface buttons {
    label: string;
    onClick: () => void;
}

const buttonTypes: Array<buttons> = [
    { label: 'Clear', onClick: clearCanvas },
    { label: 'Undo', onClick: undo},
    { label: 'Redo', onClick: redo}
];

function createButton(buttonType: buttons) {
    const button = document.createElement('button');
    button.innerHTML = buttonType.label;
    button.addEventListener('click', buttonType.onClick);
    app.appendChild(button);
    return button;
}

for (const buttonType of buttonTypes) {
    createButton(buttonType);
}

function clearCanvas() {
    lines.splice(0, lines.length);
    redoLines.splice(0, redoLines.length);
    canvas.dispatchEvent(drawingChangedEvent);
}

function undo() {
    if (lines.length > 0) {
        const lastLine = lines.pop()!;
        redoLines.push(lastLine);
        canvas.dispatchEvent(drawingChangedEvent);
    }
}

function redo() {
    if (redoLines.length > 0) {
        const lineToRedo = redoLines.pop()!;
        lines.push(lineToRedo);
        canvas.dispatchEvent(drawingChangedEvent);
    }

}

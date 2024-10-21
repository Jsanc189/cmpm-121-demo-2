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

const drawingContext: CanvasRenderingContext2D = canvas.getContext('2d');

const lines: Array<Line> = [];
const redoLines: Array<Line> = [];
let currentLine: Line | null = null;

const startingX:number = 0;
const startingY:number = 0;
const sizeFactor:number = 10;
const colors: Array<string> = ["black", "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "gray"];
const rotationDegrees: Array<number> = [0, 90, 180, 270];

interface Displayable {
    display(context: CanvasRenderingContext2D): void;
};

let lineThickness:number = 3;
let currentColorIndex:number = 0;
let currentRotationIndex: number = 3;

class Line implements Displayable {
    public points: Array<{ x: number; y: number }>;
    public thickness:number;
    public character:string;
    public color: string;
    public rotation: number;
    
    constructor() {
        this.points = [];
        this.thickness = lineThickness;
        this.character = cursorCommand.shape;
        this.color = colors[currentColorIndex];
        this.rotation = rotationDegrees[currentRotationIndex];
    }

    display(context: CanvasRenderingContext2D): void {
      if (this.points.length >= 1) {
        context.lineWidth = this.thickness;
        context.beginPath();
        const { x, y } = this.points[0];
        context.moveTo(x, y);
        for (const { x, y } of this.points) {
            context.font = (this.thickness * sizeFactor) + "px Arial";
            context.fillStyle = this.color;
            rotateSticker(this.character, x, y, this.rotation);
        }
        context.stroke();
      }
    }
} 

const drawingChangedEvent = new Event('drawing-changed');

canvas.addEventListener('drawing-changed', () => {
    if (drawingContext) {
        drawingContext.clearRect(startingX, startingY, canvas.width, canvas.height);
        lines.forEach(line => line.display(drawingContext));
        cursorCommand.execute();
    }
});


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

function canvasMarker() {
    cursorCommand.shape = '.';
    currentColorIndex = (currentColorIndex + 1) % colors.length;
}


function thin() {
    if (lineThickness > 1){
        lineThickness -= 1;
    }
}

function thick() {
    lineThickness += 1;
}


//export canvas to save file
function exportCanvas() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    
    const exportCanvasContext = exportCanvas.getContext('2d');
    if (exportCanvasContext && drawingContext) {
        exportCanvasContext.drawImage(canvas, startingX, startingY, exportCanvas.width, exportCanvas.height);
        exportCanvasContext.scale(4,4);
    }

    const link = document.createElement('a');
    link.href = exportCanvas.toDataURL('image/png');
    link.download = 'drawing.png';
    link.click();

}


interface buttons {
    label: string;
    onClick: () => void;
}

const buttonTypes: Array<buttons> = [
    { label: 'Clear', onClick: clearCanvas },
    { label: 'Undo', onClick: undo},
    { label: 'Redo', onClick: redo},
    { label: 'Marker', onClick: canvasMarker},
    { label: 'Thin', onClick: thin},
    { label: 'Thick', onClick: thick},
    { label: 'Export', onClick: exportCanvas},
    { label: 'Custom Sticker', onClick: customSticker},

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

const emojis: Array<string> = ['👻', '🐈‍⬛', '🌕'];

const stickerButtonTypes = emojis.map(emoji => ({
    label: emoji,
     onClick: () => toolMoved(emoji),
}))


stickerButtonTypes.forEach(buttonType => {
    createButton(buttonType);
});

function toolMoved(shape: string) {
    cursorCommand.shape = shape;
    currentRotationIndex = (currentRotationIndex + 1) % rotationDegrees.length;
    rotateSticker(cursorCommand.shape, cursor.x, cursor.y, rotationDegrees[currentRotationIndex]);
 }

function rotateSticker(text: string, x: number, y: number, angle: number) {
    drawingContext.save();
    drawingContext.translate(x, y);
    drawingContext.rotate(angle * Math.PI / 180);
    drawingContext.fillText(text, 0, 0);
    drawingContext.restore();
}

function customSticker() {
    const text:string = prompt("Custom sticker text");
    emojis.push(text);
    createButton({label: text, onClick: ()=> toolMoved(text)})  
}

const cursor = { active: false, x: startingX, y: startingY };

interface Command {
    execute(): void;
}

class cursorShape implements Command{  
    private context: CanvasRenderingContext2D | null;
    public shape:string;
    public thickness:number;
    public x:number;
    public y:number;

    constructor(shape: string, x:number, y:number) {
        this.context = drawingContext;
        this.shape = shape;
        this.thickness = lineThickness;
        this.x = x;
        this.y = y;
    }

    execute(): void {
        if (drawingContext) {
            drawingContext.font = (this.thickness * sizeFactor) + "px Arial";
            drawingContext.fillStyle = colors[currentColorIndex];
            rotateSticker(this.shape, this.x, this.y, rotationDegrees[currentRotationIndex]);
        }
    }

}

let cursorCommand:cursorShape = new cursorShape('.', startingX, startingY);

canvas.addEventListener('mousedown', (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

    if (cursor.active && cursorCommand.shape != ' ') {
        currentLine = new Line();
        currentLine.points.push({ x: cursor.x, y: cursor.y });
        lines.push(currentLine);
    }
  
  canvas.dispatchEvent(drawingChangedEvent);
});

canvas.addEventListener('mouseup', () => {
    cursor.active = false;
    currentLine = null;
    canvas.dispatchEvent(drawingChangedEvent);
  });

canvas.addEventListener('mouseenter', (e) => {
    cursorCommand = new cursorShape(cursorCommand.shape, e.offsetX, e.offsetY);
    canvas.style.cursor = 'none';
    canvas.dispatchEvent(drawingChangedEvent);
});

canvas.addEventListener('mouseout', () => {
    canvas.style.cursor = 'default';
    canvas.dispatchEvent(drawingChangedEvent);
})

canvas.addEventListener('mousemove', (e) => {
    const cursorX = e.offsetX;
    const cursorY = e.offsetY;

    cursorCommand = new cursorShape(cursorCommand.shape, e.offsetX, e.offsetY);
    cursorCommand.thickness = lineThickness;
    
    if (cursor.active && currentLine) {
       currentLine.points.push({ x: cursorX, y: cursorY });
    }
    canvas.dispatchEvent(drawingChangedEvent);
     
});

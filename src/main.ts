import "./style.css";

const APP_NAME = "DecoDoodle";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME

const header = document.createElement("h1");
header.innerHTML = APP_NAME;
header.style.fontSize = "50px";
app.append(header);

//L: Divs for sidebar display.
const mainDiv = document.createElement('div');
mainDiv.id = 'mainDiv'
const canvasDiv = document.createElement('div');
const controlsDiv = document.createElement('div');
app.append(mainDiv)
mainDiv.append(canvasDiv)
mainDiv.append(controlsDiv)

const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
canvas.id = `canvas`;
canvasDiv.appendChild(canvas);

//L: Changed general div into multiple, separate boxes.
const commandDiv = document.createElement('div');
const commandH3 = document.createElement('h3');
commandH3.innerHTML = 'Commands'
commandDiv.append(commandH3);

const markerDiv = document.createElement('div');
const markerH3 = document.createElement('h3')
markerH3.innerHTML = 'Markers'
markerDiv.append(markerH3);

const stickerDiv = document.createElement('div');
const stickerH3 = document.createElement('h3');
stickerH3.innerHTML = 'Stickers'
stickerDiv.append(stickerH3);

controlsDiv.append(commandDiv);
controlsDiv.append(markerDiv);
controlsDiv.append(stickerDiv);

const drawingContext: CanvasRenderingContext2D = canvas.getContext('2d')!;

const lines: Array<Line> = [];
const redoLines: Array<Line> = [];
let currentLine: Line | null = null;

const startingX:number = 0;
const startingY:number = 0;
const sizeFactor:number = 10;
const colors: Array<string> = ["black", "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "gray"];
const rotationDegrees: Array<number> = [0, 90, 180, 270];

let lineThickness:number = 3;
let currentColorIndex:number = 0;
let currentRotationIndex: number = 3;

interface Command {
    execute(ctx: CanvasRenderingContext2D): void;
}

class Line implements Command {
    public ctx: CanvasRenderingContext2D;
    public points: Array<{ x: number; y: number }>;
    public thickness:number;
    public character:string;
    public color: string;
    public rotation: number;
    
    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.points = [];
        this.thickness = lineThickness;
        this.character = cursorCommand.shape;
        this.color = colors[currentColorIndex];
        this.rotation = rotationDegrees[currentRotationIndex];
    }

    execute(ctx: CanvasRenderingContext2D): void {
      if (this.points.length >= 1) {
        ctx.lineWidth = this.thickness;
        ctx.beginPath();
        const { x, y } = this.points[0];
        ctx.moveTo(x, y);
        for (const { x, y } of this.points) {
            ctx.font = (this.thickness * sizeFactor) + "px Arial";
            ctx.fillStyle = this.color;
            rotateSticker(this.character, x, y, this.rotation);
        }
        ctx.stroke();
      }
    }
}

class cursorShape implements Command{  
    private ctx: CanvasRenderingContext2D | null;
    public shape:string;
    public thickness:number;
    public x:number;
    public y:number;

    constructor(ctx: CanvasRenderingContext2D, shape: string, x:number, y:number) {
        this.ctx = ctx;
        this.shape = shape;
        this.thickness = lineThickness;
        this.x = x;
        this.y = y;
    }

    execute(ctx: CanvasRenderingContext2D): void {
        if (ctx) {
            ctx.font = (this.thickness * sizeFactor) + "px Arial";
            ctx.fillStyle = colors[currentColorIndex];
            rotateSticker(this.shape, this.x, this.y, rotationDegrees[currentRotationIndex]);
        }
    }

}

const drawingChangedEvent = new Event('drawing-changed');

canvas.addEventListener('drawing-changed', () => {
    if (drawingContext) {
        drawingContext.clearRect(startingX, startingY, canvas.width, canvas.height);
        lines.forEach(line => line.execute(drawingContext));
        cursorCommand.execute(drawingContext);
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
    box: HTMLDivElement;
}

const buttonTypes: Array<buttons> = [
    { label: 'Clear', onClick: clearCanvas, box: commandDiv },
    { label: 'Undo', onClick: undo, box: commandDiv },
    { label: 'Redo', onClick: redo, box: commandDiv },
    { label: 'Marker', onClick: canvasMarker, box: markerDiv },
    { label: 'Thin', onClick: thin, box: markerDiv },
    { label: 'Thick', onClick: thick, box: markerDiv },
    { label: 'Export', onClick: exportCanvas, box: commandDiv },
    { label: 'Custom Sticker', onClick: customSticker, box: stickerDiv },

];



function createButton(buttonType: buttons) {
    const button = document.createElement('button');
    button.innerHTML = buttonType.label;
    button.addEventListener('click', buttonType.onClick);
    buttonType.box.append(button);
    return button;
}

for (const buttonType of buttonTypes) {
    createButton(buttonType);
}

const emojis: Array<string> = ['👻', '🐈‍⬛', '🌕'];

const stickerButtonTypes = emojis.map(emoji => ({
    label: emoji,
    onClick: () => toolMoved(emoji),
    box: stickerDiv
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
    const text:string = prompt("Custom sticker text")!;
    emojis.push(text);
    createButton({label: text, onClick: ()=> toolMoved(text), box: stickerDiv})  
}

const cursor = { active: false, x: startingX, y: startingY };

let cursorCommand:cursorShape = new cursorShape(drawingContext, '.', startingX, startingY);

canvas.addEventListener('mousedown', (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

    if (cursor.active && cursorCommand.shape != ' ') {
        currentLine = new Line(drawingContext);
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
    cursorCommand = new cursorShape(drawingContext, cursorCommand.shape, e.offsetX, e.offsetY);
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

    cursorCommand = new cursorShape(drawingContext, cursorCommand.shape, e.offsetX, e.offsetY);
    cursorCommand.thickness = lineThickness;
    
    if (cursor.active && currentLine) {
       currentLine.points.push({ x: cursorX, y: cursorY });
    }
    canvas.dispatchEvent(drawingChangedEvent);
     
});

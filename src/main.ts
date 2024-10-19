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

const drawingContext: CanvasRenderingContext2D | null = canvas.getContext('2d');

const lines: Array<Line> = [];
const redoLines: Array<Line> = [];
let currentLine: Line | null = null;

const cursor = { active: false, x: 0, y: 0 };

interface Displayable {
    display(context: CanvasRenderingContext2D): void;
};

let lineThickness:number = 3;

class Line implements Displayable {
    public points: Array<{ x: number; y: number }>;
    public thickness:number;
    public character:string;
    
    constructor() {
        this.points = [];
        this.thickness = lineThickness;
        this.character = cursorCommand.shape;
    }

    display(context: CanvasRenderingContext2D): void {
      if (this.points.length >= 1) {
        context.lineWidth = this.thickness;
        context.beginPath();
        const { x, y } = this.points[0];
        context.moveTo(x, y);
        for (const { x, y } of this.points) {
            context.font = (this.thickness*10) + "px Arial";
          context.fillText(this.character, x-4, y);
        }
        context.stroke();
      }
    }
} 

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
            drawingContext.font = (this.thickness*10) + "px Arial";
            drawingContext.fillStyle = "black";
            drawingContext.fillText(this.shape, this.x-4, this.y)
        }
    }

}


interface buttons {
    label: string;
    onClick: () => void;
}

const buttonTypes: Array<buttons> = [
    { label: 'Clear', onClick: clearCanvas },
    { label: 'Undo', onClick: undo},
    { label: 'Redo', onClick: redo},
    { label: 'Thin', onClick: thin},
    { label: 'Thick', onClick: thick},
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

let emojis: Array<string> = ['👻', '🐈‍⬛', '🌕'];

const stickerButtonTypes = emojis.map(emoji => ({
    label: emoji,
     onClick: () => toolMoved(emoji),
}))


stickerButtonTypes.forEach(buttonType => {
    createButton(buttonType);
});

function toolMoved(shape: string) {
    cursorCommand.shape = shape;
 }

let cursorCommand:cursorShape = new cursorShape('.', 0, 0);

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

    cursorCommand = new cursorShape(cursorCommand.shape, cursorX, cursorY);
    cursorCommand.thickness = lineThickness;

    
    if (cursor.active && currentLine) {
       currentLine.points.push({ x: cursorX, y: cursorY });
    }
    canvas.dispatchEvent(drawingChangedEvent);
     
});


const drawingChangedEvent = new Event('drawing-changed');

canvas.addEventListener('drawing-changed', () => {
    if (drawingContext) {
        drawingContext.clearRect(0, 0, canvas.width, canvas.height);
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

function thin() {
    if (lineThickness > 1){
        lineThickness -= 1;
    }
}

function thick() {
    lineThickness += 1;
}

function customSticker() {
    let text:string = prompt("Custom sticker text");
    emojis.push(text);
    createButton({label: text, onClick: ()=> toolMoved(text)})  
}


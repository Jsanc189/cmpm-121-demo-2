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
    
    constructor() {
        this.points = [];
        this.thickness = lineThickness;
    }

    display(context: CanvasRenderingContext2D): void {
      if (this.points.length > 1) {
        context.lineWidth = this.thickness;
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


class cursorShape {  
    public shape:string;
    public thickness:number;
    public x:number;
    public y:number;

    constructor(shape: string, x:number, y:number) {
        this.shape = shape;
        this.thickness = lineThickness;
        this.x = x;
        this.y = y;
    }

    execute() {
        if (drawingContext) {
            drawingContext.font = (this.thickness*10) + "px Arial";
            drawingContext.fillStyle = "black";
            drawingContext.fillText(this.shape, this.x-4, this.y)
        }
    }

}

let cursorChangedShape:boolean = false;
let cursorCommand:cursorShape = new cursorShape('.', 0, 0);
let cursorHolder:cursorShape = new cursorShape(' ', 0, 0);

canvas.addEventListener('mousedown', (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  if (cursorCommand.shape != '.') {
    cursorHolder = cursorCommand;
    cursorCommand.shape = '.';

  }

  currentLine = new Line();
  currentLine.points.push({ x: cursor.x, y: cursor.y });
  lines.push(currentLine);
  
  canvas.dispatchEvent(drawingChangedEvent);
});

canvas.addEventListener('mouseup', () => {
    cursor.active = false;
    currentLine = null;
    if (cursorChangedShape == true) {
        cursorCommand.shape = cursorHolder.shape;
    }
  
    canvas.dispatchEvent(drawingChangedEvent);
  });

canvas.addEventListener('mouseenter', (e) => {
    canvas.style.cursor = 'none';
    canvas.dispatchEvent(drawingChangedEvent);
});

canvas.addEventListener('mouseout', () => {
    canvas.style.cursor = 'default';
    cursorCommand = new cursorShape(' ', 0, 0);
    canvas.dispatchEvent(drawingChangedEvent);
})

canvas.addEventListener('mousemove', (e) => {
    const cursorX = e.offsetX;
    const cursorY = e.offsetY;
    if (cursorChangedShape) {
        cursorCommand = new cursorShape(cursorCommand.shape, cursorX, cursorY);
    } else {
        cursorCommand = new cursorShape('.', cursorX, cursorY);
    }

    if (cursor.active && currentLine) {
       currentLine.points.push({ x: cursorX, y: cursorY });
    }
    canvas.dispatchEvent(drawingChangedEvent);
     
});


const drawingChangedEvent = new Event('drawing-changed');

canvas.addEventListener('drawing-changed', () => {
    drawingContext.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lines) {
        line.display(drawingContext);
    }

    if (cursorCommand) {
        cursorCommand.execute();
    }
});

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
    { label: '👻', onClick: toolMoved('👻')},
    {label: '🐈‍⬛', onClick: toolMoved('🐈‍⬛')},
    {label:'🌕', onClick: toolMoved('🌕')},
];

function toolMoved(shape:string) {
   return function() {
        if (cursorCommand.shape === shape) {
            cursorChangedShape = false;
            cursorCommand.shape = '.';
        }else{    
            cursorChangedShape = true;
            cursorCommand.shape = shape;
        }
        canvas.dispatchEvent(drawingChangedEvent);
    }
}

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

function thin() {
    if (lineThickness > 1){
        lineThickness -= 1;
    }
}

function thick() {
    lineThickness += 1;
}


import "./style.css";

const APP_NAME = "Did you turn it off and turn it back on again?";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

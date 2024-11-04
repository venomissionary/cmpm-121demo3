
const Canvascontainer = document.createElement("div");
Canvascontainer.id = "canvascontainer";
Canvascontainer.style.padding = "20px";

document.body.style.backgroundColor = "#2e2e2e";
document.body.style.color = "#ffffff";

const Simplebutton = document.createElement('button');
Simplebutton.textContent = "test button";
Simplebutton.style.padding = "40px 20px"
Simplebutton.style.marginTop = "350px";
Simplebutton.style.border = "200px";
Simplebutton.style.borderRadius = "100px";
Simplebutton.style.boxShadow = "0px 4px 15px rgba(0, 0, 0, 0.5)"

Simplebutton.addEventListener('click', () => {
    Simplebutton.style.transform = "scale(0.90)";
    setTimeout(() => {
        Simplebutton.style.transform = "scale(1.0)";

    }, 155);
});

document.body.appendChild(Canvascontainer);
Canvascontainer.appendChild(Simplebutton);

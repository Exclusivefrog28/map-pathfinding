const clearCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillStyle = "#0d1117";
ctx.strokeStyle = "white";

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const minX = 16.55;
const minY = 47.125;
const size = 0.2;

const aspectRatio = canvas.width / canvas.height;

const maxX = minX + size * aspectRatio;
const maxY = minY + size;

const mapX = (x) => {
    return ((x - minX) / (maxX - minX)) * canvas.width + (centerX - (size * canvas.width) / 2);
}

const mapY = (y) => {
    return ((y - minY) / (maxY - minY)) * canvas.height;
}

fetch('./nodes.json').then((response) => response.json())
    .then((nodes) => {
        for (const node of nodes) {
            for (const connection of node.connections) {
                ctx.beginPath();
                ctx.moveTo(mapX(node.x), mapY(node.y));
                const connectedNode = nodes[connection];
                ctx.lineTo(mapX(connectedNode.x), mapY(connectedNode.y));
                ctx.stroke();
            }
        }
    });
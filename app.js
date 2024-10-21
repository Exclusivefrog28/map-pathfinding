const clearCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillStyle = "#0d1117";
ctx.strokeStyle = "white";
ctx.lineWidth = 1;

let centerX = 16.622;
let centerY = 47.23;

let scale = 10000;

const aspectRatio = canvas.width / canvas.height;

const mapX = (x) => {
    return (x - centerX) * scale + (canvas.width) / 2;
}

const mapY = (y) => {
    return -(y - centerY) * scale + (canvas.height) / 2;
}

const invX = (x) => {
    return (x - (canvas.width) / 2) / scale + centerX
}

const invY = (y) => {
    return -(y - (canvas.height) / 2) / scale + centerY
}

const drawLines = (lines, color) => {
    ctx.strokeStyle = color;
    for (const line of lines) {
        ctx.beginPath();
        ctx.moveTo(mapX(line[0]), mapY(line[1]));
        ctx.lineTo(mapX(line[2]), mapY(line[3]));
        ctx.stroke();
    }
}

const drawNode = (node, color) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(mapX(node.x), mapY(node.y), 5, 0, 2 * Math.PI);
    ctx.stroke();
}

const closestNode = (nodes, x, y) => {
    let closest = nodes[0];
    let closestDistance = (x - closest.x) ** 2 + (y - closest.y) ** 2
    for (const node of nodes) {
        if ((x - node.x) ** 2 + (y - node.y) ** 2 < closestDistance) {
            closest = node;
            closestDistance = (x - closest.x) ** 2 + (y - closest.y) ** 2
        }
    }

    return closest
}

const aStar = (nodes, start, end) => {
    const visited = new Set();
    const queue = new Heap((a, b) => a.g + a.h - b.g - b.h);
    queue.push({node: start, g:0, h:0});
    const previous = new Map();
    const search = [];

    let finished = false;

    while (!finished) {
        const {node: node, g: distance} = queue.pop();
        for (const connection of nodes[node].connections) {
            if (!visited.has(connection)) {
                visited.add(connection);
                const newDistance = Math.sqrt((nodes[node].x - nodes[connection].x) ** 2 + (nodes[node].y - nodes[connection].y) ** 2)
                const endDistance = Math.sqrt((nodes[end].x - nodes[connection].x) ** 2 + (nodes[end].y - nodes[connection].y) ** 2)
                queue.push({node: connection, g: distance + newDistance, h: endDistance});
                previous.set(connection, node);
            }
            if (connection === end) {
                finished = true;
                break;
            };
        }

        const prev = previous.get(node);
        if (prev !== undefined) search.push([nodes[node].x, nodes[node].y, nodes[prev].x, nodes[prev].y]);

    }

    let current = end;
    const path = [];
    while (current !== start) {
        const prevNode = previous.get(current);
        path.push([nodes[current].x, nodes[current].y, nodes[prevNode].x, nodes[prevNode].y]);
        current = prevNode;
    }

    return [search, path];
}

(async () => {
    const { nodes, edges } = await (await fetch('./nodes.json')).json();

    drawLines(edges, 'white');

    let start = undefined;
    let end = undefined;
    let search = [];
    let path = [];

    const update = () => {
        clearCanvas();
        drawLines(edges, 'white');
        if (start !== undefined) drawNode(start, 'lime');
        if (end !== undefined) drawNode(end, 'red');
        drawLines(search, 'blue');
        drawLines(path, 'lime');
    }

    let drag = false;
    let dragStart = undefined;
    let dragDistance = 0;

    canvas.addEventListener('mousedown', (e) => {
        drag = true;
        dragDistance = 0;
        dragStart = [e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop];
    });

    canvas.addEventListener('mousemove', (e) => {
        if (drag) {
            const x = e.clientX - canvas.offsetLeft;
            const y = e.clientY - canvas.offsetTop;
            const deltaX = x - dragStart[0];
            const deltaY = y - dragStart[1];

            centerX -= deltaX / scale;
            centerY += deltaY / scale;

            update();

            dragDistance += Math.sqrt(deltaX ** 2 + deltaY ** 2);
            dragStart = [x, y];
        }
    }
    );

    canvas.addEventListener('mouseup', (e) => {
        if (drag) {
            drag = false;
            if (dragDistance < 10) {
                const x = e.clientX - canvas.offsetLeft;
                const y = e.clientY - canvas.offsetTop;

                const closest = closestNode(nodes, invX(x), invY(y))

                if (start === undefined || end) {
                    start = closest;
                    end = undefined;
                    drawNode(start, 'lime');
                }
                else if (end === undefined) {
                    end = closest;
                    drawNode(end, 'red');
                    [search, path] = aStar(nodes, nodes.indexOf(start), nodes.indexOf(end));
                    update();
                }
            }
        }
        dragDistance = 0;
    });

    document.addEventListener("wheel", (event) => {
        event.preventDefault();
        scale *= (-event.deltaY / 1000) + 1;
        update();
    });

})()




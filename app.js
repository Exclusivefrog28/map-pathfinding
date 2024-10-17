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

const minX = 16.61;
const minY = 47.18;
const size = 0.1;

const aspectRatio = canvas.width / canvas.height;

const maxX = minX + size * aspectRatio;
const maxY = minY + size;

const mapX = (x) => {
    return ((x - minX) / (maxX - minX)) * canvas.width + (centerX - (size * canvas.width) / 2);
}

const mapY = (y) => {
    return canvas.height - (((y - minY) / (maxY - minY)) * canvas.height);
}

const invX = (x) => {
    return ((x - (centerX - (size * canvas.width) / 2)) / canvas.width) * (maxX - minX) + minX;
}

const invY = (y) => {
    return ((canvas.height - y) / canvas.height) * (maxY - minY) + minY;
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

const dijkstra = (nodes, start, end) => {
    const visited = new Set();
    const queue = [[start, 0]];
    const previous = new Map();

    let finished = false;

    while (!finished) {
        queue.sort((a, b) => a[1] - b[1]);
        const [node, distance] = queue.shift();
        for (const connection of nodes[node].connections) {
            if (!visited.has(connection)) {
                visited.add(connection);
                const newDistance = (nodes[node].x - nodes[connection].x) ** 2 + (nodes[node].y - nodes[connection].y) ** 2
                queue.push([connection, distance + newDistance]);
                previous.set(connection, node);
            }
            if (connection === end) {
                finished = true;
                break;
            };
        }

        const prev = previous.get(node);
        if (prev !== undefined) {
            ctx.strokeStyle = 'blue';
            ctx.beginPath();
            ctx.moveTo(mapX(nodes[node].x), mapY(nodes[node].y));
            ctx.lineTo(mapX(nodes[prev].x), mapY(nodes[prev].y));
            ctx.stroke();
        }
    }

    let current = end;
    while (current !== start) {
        ctx.strokeStyle = 'lime';
        ctx.beginPath();
        ctx.moveTo(mapX(nodes[current].x), mapY(nodes[current].y));
        ctx.lineTo(mapX(nodes[previous.get(current)].x), mapY(nodes[previous.get(current)].y));
        ctx.stroke();
        current = previous.get(current);
    }
}

(async () => {
    const nodes = await (await fetch('./nodes.json')).json();

    for (const node of nodes) {
        for (const connection of node.connections) {
            ctx.beginPath();
            ctx.moveTo(mapX(node.x), mapY(node.y));
            const connectedNode = nodes[connection];
            ctx.lineTo(mapX(connectedNode.x), mapY(connectedNode.y));
            ctx.stroke();
        }
    }

    let start = undefined;
    let end = undefined;

    canvas.addEventListener('click', (e) => {
        const x = e.clientX - canvas.offsetLeft;
        const y = e.clientY - canvas.offsetTop;

        const closest = closestNode(nodes, invX(x), invY(y))

        if (start === undefined || end) {
            start = closest;
            end = undefined;
            ctx.strokeStyle = 'lime';
            ctx.beginPath()
            ctx.arc(mapX(closest.x), mapY(closest.y), 5, 0, 2 * Math.PI);
            ctx.stroke();
        }
        else if (end === undefined) {
            end = closest;
            ctx.strokeStyle = 'red';
            ctx.beginPath()
            ctx.arc(mapX(closest.x), mapY(closest.y), 5, 0, 2 * Math.PI);
            ctx.stroke();
            dijkstra(nodes, nodes.indexOf(start), nodes.indexOf(end));
        }
    })

})()




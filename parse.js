const mapData = require('./szhely.json');
const { writeFile } = require('fs');

const nodes = [];
const edges = [];


for (const feature of mapData.features) {
    if (feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon') {
        let coordinates = feature.geometry.type === 'LineString' ? feature.geometry.coordinates : feature.geometry.coordinates[0];

        let previousNode = -1;
        const oneWay = feature.properties.oneway === 'yes';
        for (const pos of coordinates) {
            const nodeIndex = nodes.findIndex(n => n.x === pos[0] && n.y === pos[1]);
            if (nodeIndex === -1) {
                nodes.push({ x: pos[0], y: pos[1], connections: (previousNode !== -1 && !oneWay) ? [previousNode] : [] });
                if (previousNode !== -1) {
                    nodes[previousNode].connections.push(nodes.length - 1);
                    edges.push([pos[0], pos[1], nodes[previousNode].x, nodes[previousNode].y]);
                }
            } else {
                if (previousNode !== -1) {
                    if (!oneWay && !nodes[nodeIndex].connections.includes(previousNode)) nodes[nodeIndex].connections.push(previousNode);
                    if (!nodes[previousNode].connections.includes(nodeIndex)) nodes[previousNode].connections.push(nodeIndex);
                    edges.push([pos[0], pos[1], nodes[previousNode].x, nodes[previousNode].y]);
                };
            }
            previousNode = nodeIndex !== -1 ? nodeIndex : nodes.length - 1;
        }
    }
}

// minX = nodes[0].x;
// maxX = nodes[0].x;
// minY = nodes[0].y;
// maxY = nodes[0].y;
// for (const node of nodes) {
//     if (node.x < minX) minX = node.x;
//     if (node.x > maxX) maxX = node.x;
//     if (node.y < minY) minY = node.y;
//     if (node.y > maxY) maxY = node.y;
// }
// console.log(minX, maxX, minY, maxY);

writeFile('nodes.json', JSON.stringify({ nodes: nodes, edges: edges }), (e) => { console.log(e) });
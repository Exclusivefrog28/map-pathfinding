const mapData = require('./szhely.json');
const { writeFile } = require('fs');

const nodes = [];

for (const feature of mapData.features) {
    if (feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon') {
        let coordinates = feature.geometry.type === 'LineString' ? feature.geometry.coordinates : feature.geometry.coordinates[0];

        let previousNode = -1;
        for (const pos of coordinates) {
            const nodeIndex = nodes.findIndex(n => n.x === pos[0] && n.y === pos[1]);
            if (nodeIndex === -1) {
                nodes.push({ x: pos[0], y: pos[1], connections: previousNode !== -1 ? [previousNode] : [], required: false });
            } else {
                if (previousNode !== -1 && !nodes[nodeIndex].connections.includes(previousNode)) nodes[nodeIndex].connections.push(previousNode);
                nodes[nodeIndex].required = true;
            }
            previousNode = nodeIndex !== -1 ? nodeIndex : nodes.length - 1;
        }
    }
}

minX = nodes[0].x;
maxX = nodes[0].x;
minY = nodes[0].y;
maxY = nodes[0].y;
for (const node of nodes) {
    if (node.x < minX) minX = node.x;
    if (node.x > maxX) maxX = node.x;
    if (node.y < minY) minY = node.y;
    if (node.y > maxY) maxY = node.y;
}
console.log(minX, maxX, minY, maxY);

writeFile('nodes.json', JSON.stringify(nodes), (e)=>{console.log(e)});
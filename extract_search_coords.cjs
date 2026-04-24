const fs = require('fs'); 
const data = JSON.parse(fs.readFileSync('C:/Users/LENOVO/.gemini/antigravity/brain/5ca6fc01-d69e-417f-9d30-988efc124eab/.system_generated/steps/91/output.txt')); 
const page = data.nodes['53:1831'] ? data.nodes['53:1831'].document : null;

function printCoords(node, prefix = '') { 
    if (['Desktop - 2', 'Search', 'Cari Lowongan.....'].includes(node.name)) {
        let style = `${prefix}${node.name} (${node.type}): `; 
        if (node.absoluteBoundingBox) { 
            style += `X:${node.absoluteBoundingBox.x} Y:${node.absoluteBoundingBox.y} W:${node.absoluteBoundingBox.width} H:${node.absoluteBoundingBox.height} `; 
        } 
        console.log(style);
    }
    if (node.children) node.children.forEach(c => printCoords(c, prefix + '  ')); 
} 
printCoords(page);

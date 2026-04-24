const fs = require('fs'); 
const data = JSON.parse(fs.readFileSync('C:/Users/LENOVO/.gemini/antigravity/brain/5ca6fc01-d69e-417f-9d30-988efc124eab/.system_generated/steps/251/output.txt')); 
const page = data.nodes['53:2713'] ? data.nodes['53:2713'].document : null;

if (!page) {
    console.log("Node not found!");
    process.exit(1);
}

function printLayout(node, prefix = '') { 
    let style = `${prefix}${node.name}: `; 
    if (node.absoluteBoundingBox) { 
        style += `X:${node.absoluteBoundingBox.x} Y:${node.absoluteBoundingBox.y} W:${node.absoluteBoundingBox.width} H:${node.absoluteBoundingBox.height} `; 
    } 
    console.log(style);
    if (node.children) node.children.forEach(c => printLayout(c, prefix + '  ')); 
} 
printLayout(page);

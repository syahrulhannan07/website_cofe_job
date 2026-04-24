const fs = require('fs'); 
const data = JSON.parse(fs.readFileSync('C:/Users/LENOVO/.gemini/antigravity/brain/5ca6fc01-d69e-417f-9d30-988efc124eab/.system_generated/steps/154/output.txt')); 
const page = data.nodes['53:2122'] ? data.nodes['53:2122'].document : null;

function printTransform(node, prefix = '') { 
    if (node.name.includes('Expand Arrow')) {
        console.log(`${prefix}${node.name}:`);
        console.log(node.relativeTransform);
    }
    if (node.children) node.children.forEach(c => printTransform(c, prefix + '  ')); 
} 
printTransform(page);

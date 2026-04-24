const fs = require('fs'); 
const data = JSON.parse(fs.readFileSync('C:/Users/LENOVO/.gemini/antigravity/brain/5ca6fc01-d69e-417f-9d30-988efc124eab/.system_generated/steps/91/output.txt')); 
const page = data.nodes['53:1831'] ? data.nodes['53:1831'].document : null;

if (!page) {
    console.log("Node 53:1831 not found in output.txt");
    process.exit(1);
}

function rgbToHex(color) { 
    if (!color) return ''; 
    const r = Math.round(color.r * 255); 
    const g = Math.round(color.g * 255); 
    const b = Math.round(color.b * 255); 
    return '#' + [r,g,b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase(); 
} 
let output = '';
function printStyles(node, prefix = '') { 
    let style = `${prefix}${node.name} (${node.type}): `; 
    if (node.absoluteBoundingBox) { 
        style += `W:${node.absoluteBoundingBox.width} H:${node.absoluteBoundingBox.height} `; 
    } 
    if (node.fills && node.fills[0] && node.fills[0].color) { 
        style += `Bg:${rgbToHex(node.fills[0].color)} `; 
    } 
    if (node.strokes && node.strokes[0] && node.strokes[0].color) { 
        style += `Border:${rgbToHex(node.strokes[0].color)} (W:${node.strokeWeight}) `; 
    } 
    if (node.cornerRadius) style += `Radius:${node.cornerRadius} `; 
    if (node.style) { 
        style += `Font:${node.style.fontFamily} ${node.style.fontWeight} ${node.style.fontSize}px Color:${node.fills && node.fills[0] && node.fills[0].color ? rgbToHex(node.fills[0].color) : ''} `; 
    } 
    if (node.paddingTop) { 
        style += `P:${node.paddingTop} ${node.paddingRight} ${node.paddingBottom} ${node.paddingLeft} gap:${node.itemSpacing} layout:${node.layoutMode}`; 
    } 
    output += style + '\n'; 
    if (node.children) node.children.forEach(c => printStyles(c, prefix + '  ')); 
} 
printStyles(page);
fs.writeFileSync('styles_output_hero.txt', output, 'utf8');
console.log("Successfully extracted to styles_output_hero.txt");

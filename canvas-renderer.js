// Canvas rendering and image processing functionality

function createHiPPICanvas(width, height) {
    const ratio = window.devicePixelRatio;
    const canvas = document.createElement("canvas");

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.getContext("2d").scale(ratio, ratio);

    return canvas;
}

// Modified from https://github.com/lukechilds/merge-images/blob/master/src/index.js
// Defaults
const defaultOptions = {
    format: 'image/png',
    quality: 1,
    width: undefined,
    height: undefined,
    Canvas: undefined,
    crossOrigin: true
};

// Return Promise
export const mergeImages = (sources = [], options = {}, offsets = {}, title = "", description = "", iconSize = 256) => new Promise(resolve => {
    options = Object.assign({}, defaultOptions, options);

    // Setup browser/Node.js specific variables
    const canvas = options.Canvas ? new options.Canvas() : createHiPPICanvas(600, 600);
    const Image = options.Image || window.Image;

    // Load sources
    const images = sources.map(source => new Promise((resolve, reject) => {
        // Convert sources to objects
        if (source.constructor.name !== 'Object') {
            source = { src: source };
        }

        // Resolve source and img when loaded
        const img = new Image();
        img.crossOrigin = options.crossOrigin;
        img.onerror = () => reject(new Error('Couldn\'t load image'));
        img.onload = () => resolve(Object.assign({}, source, { img }));
        img.src = source.src;
    }));

    // Get canvas context
    const ctx = canvas.getContext('2d');

    // When sources have loaded
    resolve(Promise.all(images)
        .then(images => {
            // Set canvas dimensions
            const getSize = dim => options[dim] || Math.max(...images.map(image => image.img[dim]));
            canvas.width = 512;
            // Allows for shiny images, otherwise the shiny part is cut off on the top and bottom
            canvas.height = 600;

            // Draw images to canvas
            images.forEach((image, index) => {
                ctx.globalAlpha = image.opacity ? image.opacity : 1;

                let xOffset = 0;
                let yOffset = 0;
                if (offsets[index]) {xOffset = offsets[index][0]; yOffset = offsets[index][1]}

                // Allows for shiny images, otherwise the shiny part is cut off on the top and bottom
                yOffset += 44;

                const xPosition = xOffset > 0 ? xOffset : image.x || 0;
                const yPosition = yOffset > 0 ? yOffset : image.y || 0;

                // Custom resize for icon
                if (index === 2) {
                    return ctx.drawImage(image.img, xPosition, yPosition, iconSize, iconSize);
                } else {
                    // Custom position for shiny frame
                    if (index === 1 && window.settings && window.settings['shinyFrame']) {
                        return ctx.drawImage(image.img, xPosition - 256, yPosition - 256);
                    } else {
                        return ctx.drawImage(image.img, xPosition, yPosition);
                    }
                }

            });

            if (title) {
                ctx.font = window.settings['titleFont'];
                ctx.fillStyle = "white";
                const maxWidth = 230;
                // If the title is multiple lines, push down the description automatically
                const numberOfTitleLines = wrapText(ctx, title, 256, window.settings['titleYOffset'], maxWidth, window.settings['titleLineHeight'])
                ctx.font = window.settings['descriptionFont'];
                wrapText(ctx, description, 256, window.settings['descriptionYOffset'] + ((numberOfTitleLines - 1) * window.settings["titleLineHeight"]), maxWidth, window.settings['descriptionLineHeight'])
            }

            if (options.Canvas && options.format === 'image/jpeg') {
                // Resolve data URI for node-canvas jpeg async
                return new Promise((resolve, reject) => {
                    canvas.toDataURL(options.format, {
                        quality: options.quality,
                        progressive: false
                    }, (err, jpeg) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(jpeg);
                    });
                });
            }

            // Resolve all other data URIs sync
            return canvas.toDataURL(options.format, options.quality);
        }));
});

function wrapText(context, text, x, y, maxWidth, lineHeight = 16) {
    // First respect the user's line breaks
    const linebreakLines = text.split("\n");

    // Now break down each of those lines into smaller lines if they are still too long
    const finalLines = [];
    linebreakLines.forEach((line) => finalLines.push(...getLines(context, line, maxWidth)))

    let inRulesSection = false;
    finalLines.forEach((line, index) => inRulesSection = writeCharacters(context, line, x, (y + (index * lineHeight)), inRulesSection));
    return finalLines.length;
}

function getLines(ctx, text, maxWidth) {
    let words = text.split(" ");
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        let word = words[i];

        const wordNoTags = word.replaceAll(/(<([^>]+)>)/gi, "");
        const currentLineNoTags = currentLine.replaceAll(/(<([^>]+)>)/gi, "");

        let width = ctx.measureText(currentLineNoTags + " " + wordNoTags).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

const colorTable = {
    scaleBonus: "#c9aa71",
    magicDamage: "#00B0F0",
    physicalDamage: "orange",
    recast: "rgb(255,143,97)",
    rules: "rgb(255, 255, 255, 0.4)",
    healing: "#60b087",
    shield: '#70b3b4',
    status: '#b29cc0',
    spellName: '#dad2b5'
}

function writeCharacters(ctx, str, x, y, inRulesSection) {
    const strNoTags = str.replaceAll(/(<([^>]+)>)/gi, "");

    const lineWidth = ctx.measureText(strNoTags).width;
    const xCenterAdjustment = lineWidth / 2;

    console.log(str);

    for(let i = 0; i <= str.length; ++i) {
        let ch = str.charAt(i);

        // Color Formatting
        if (ch === "<") {
            const endOfTag = str.indexOf(">", i);
            if (endOfTag !== -1) {
                const colorName = str.substring(i + 1, endOfTag);
                const colorValue = colorTable[colorName];
                if (colorValue) {
                    ctx.fillStyle = colorValue;
                    if (colorName === "rules") {
                        ctx.font = "italic";
                        inRulesSection = true;
                        console.log("got rules");
                    }
                } else {
                    // Continue with rules formatting until the rules section ends
                    if (inRulesSection) {
                        console.log('rulesss');
                        ctx.fillStyle = colorTable["rules"];
                        ctx.font = "italic";
                    } else {
                        ctx.fillStyle = "white";
                        inRulesSection = false;
                    }
                }
                i += endOfTag - i;
                continue;
            }
        }

        ctx.fillText(ch, x - xCenterAdjustment, y);
        x += Math.round(ctx.measureText(ch).width);
    }
    return inRulesSection;
}

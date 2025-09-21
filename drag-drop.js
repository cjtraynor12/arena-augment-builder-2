// Drag and drop functionality for custom images

export function initializeDragDrop() {
    const canvasContainer = document.getElementById('canvasContainer');
    const dropOverlay = document.getElementById('dropOverlay');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        canvasContainer.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        canvasContainer.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        canvasContainer.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    canvasContainer.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    const canvasContainer = document.getElementById('canvasContainer');
    canvasContainer.classList.add('drag-over');
}

function unhighlight(e) {
    const canvasContainer = document.getElementById('canvasContainer');
    canvasContainer.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    handleFiles(files);
}

function handleFiles(files) {
    ([...files]).forEach(handleFile);
}

function handleFile(file) {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        alert('Please drop an image file (jpg, png, gif, webp)');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageDataUrl = e.target.result;
        setCustomImage(imageDataUrl);
    };
    reader.readAsDataURL(file);
}

function setCustomImage(imageDataUrl) {
    // Clear current selections
    window.settings['selectedAugment'] = null;
    window.settings['selectedChampion'] = null;
    window.settings['customImage'] = imageDataUrl;
    
    // Set default title and description for custom images
    window.settings['augmentTitle'] = "Custom Augment";
    window.settings['augmentDescription'] = "Custom description";
    
    // Update UI inputs
    document.getElementById('titleInput').value = window.settings['augmentTitle'];
    document.getElementById('descriptionInput').value = window.settings['augmentDescription'];
    
    // Render the image
    window.mergeAugmentImages();
}

export function hasCustomImage() {
    return window.settings && window.settings['customImage'];
}

export function getCustomImage() {
    return window.settings ? window.settings['customImage'] : null;
}

export function clearCustomImage() {
    if (window.settings) {
        window.settings['customImage'] = null;
    }
}

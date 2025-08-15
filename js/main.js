// Main application file - coordinates all modules

import { mergeImages } from './canvas-renderer.js';
import { 
    getAugmentData, 
    getChampionData, 
    populateDescriptionVariables, 
    getAugmentById, 
    getChampionById,
    getCommunityDragonBaseUrl,
    getBaseSquarePortraitPath,
    arenaJsonData,
    championJsonData
} from './data-manager.js';
import { 
    updateAugmentSearch, 
    updateChampionSearch, 
    displayAugments, 
    displayChampions, 
    filterAugments, 
    filterChampions,
    setDefaultTitleFont,
    setDefaultDescriptionFont,
    updateCanvasVariable,
    updateFrameVariable
} from './ui-manager.js';
import { initializeDragDrop, hasCustomImage, getCustomImage, clearCustomImage } from './drag-drop.js';

// Global settings object
window.settings = {
    selectedAugment: null,
    selectedFrame: "augmentcard_frame_prismatic.png",
    shinyFrame: false,
    augmentTitle: "",
    augmentDescription: "",
    iconXOffset: 156,
    iconYOffset: 40,
    titleFont: "bold 24px LolBeautfortBold",
    descriptionFont: "14px LolBeautfort",
    selectedChampion: null,
    titleYOffset: 324,
    descriptionYOffset: 364,
    titleLineHeight: 26,
    descriptionLineHeight: 18,
    language: 'en_us',
    customImage: null
};

// Border Images
const borderImages = {
    augmentcard_bg: "augmentcard_bg.png",
    augmentcard_frame_silver: "augmentcard_frame_silver.png",
    augmentcard_frame_gold: "augmentcard_frame_gold.png",
    augmentcard_frame_prismatic: "augmentcard_frame_prismatic.png",
    augmentcard_sheenglow_silver: "augmentcard_sheenglow_silver.png",
    augmentcard_sheenglow_gold: "augmentcard_sheenglow_gold.png",
    augmentcard_sheenglow_prismatic: "augmentcard_sheenglow_prismatic.png",
};

const augmentFrameBaseUrl = getCommunityDragonBaseUrl() + "assets/ux/cherry/augments/augmentselection/";

// Make functions globally available for HTML onclick handlers
window.updateAugmentSearch = updateAugmentSearch;
window.updateChampionSearch = updateChampionSearch;
window.updateCanvasVariable = updateCanvasVariable;
window.updateFrameVariable = updateFrameVariable;
window.setSelectedAugment = setSelectedAugment;
window.setSelectedChampion = setSelectedChampion;
window.setLanguage = setLanguage;
window.mergeAugmentImages = mergeAugmentImages;

function setSelectedAugment(id) {
    window.settings['selectedAugment'] = getAugmentById(id);
    window.settings['selectedChampion'] = null;
    clearCustomImage();

    const rarity = window.settings['selectedAugment']['rarity'];
    switch (rarity) {
        case 0:
            window.settings['selectedFrame'] = borderImages['augmentcard_frame_silver'];
            break;
        case 1:
            window.settings['selectedFrame'] = borderImages['augmentcard_frame_gold'];
            break;
        case 2:
            window.settings['selectedFrame'] = borderImages['augmentcard_frame_prismatic'];
            break;
        default:
            window.settings['selectedFrame'] = borderImages['augmentcard_bg'];
    }
    window.settings['shinyFrame'] = false;

    window.settings['augmentTitle'] = window.settings['selectedAugment']['name'];
    document.getElementById('titleInput').value = window.settings['augmentTitle'];
    window.settings['augmentDescription'] = populateDescriptionVariables(window.settings['selectedAugment']);
    document.getElementById('descriptionInput').value = window.settings['augmentDescription'];

    mergeAugmentImages();
}

function setSelectedChampion(id) {
    window.settings['selectedChampion'] = getChampionById(id);
    window.settings['selectedAugment'] = null;
    clearCustomImage();
    console.log(window.settings['selectedChampion']['name']);
    mergeAugmentImages();
}

function mergeAugmentImages() {
    let iconImage;
    let iconSize;
    let imagePositionOffsets;

    // For custom images
    if (hasCustomImage()) {
        iconImage = getCustomImage();
        iconSize = 150;
    }
    // For augments
    else if (window.settings['selectedAugment'] !== null) {
        iconImage = getCommunityDragonBaseUrl() + window.settings['selectedAugment']['iconLarge'];
        iconSize = 150;
    } 
    // For champions
    else if (window.settings['selectedChampion'] !== null) {
        iconImage = getBaseSquarePortraitPath() + window.settings['selectedChampion']['id'] + ".png";
        iconSize = 150;
    } else {
        return;
    }

    const modifiedXOffset = parseInt(window.settings['iconXOffset']) + 25;
    const modifiedYOffset = parseInt(window.settings['iconYOffset']) + 10;
    imagePositionOffsets = {2:[modifiedXOffset, modifiedYOffset]};

    const images = [
        augmentFrameBaseUrl + borderImages['augmentcard_bg'],
        augmentFrameBaseUrl + window.settings['selectedFrame'],
        iconImage
    ];

    const options = {};

    mergeImages(images, options, imagePositionOffsets, window.settings['augmentTitle'], window.settings['augmentDescription'], iconSize)
        .then(b64 => document.getElementById('imageOutput').src = b64);
}

async function setLanguage(value) {
    window.settings['language'] = value;
    await getAugmentData(value);
    if (window.settings['selectedAugment']) {
        setSelectedAugment(window.settings['selectedAugment']['id']);
    }

    // Fix an issue where changing language breaks searching augments
    const augmentsList = document.getElementById("augmentsList");
    augmentsList.innerHTML = "";
    displayAugments(arenaJsonData);
    filterAugments();

    mergeAugmentImages();
}

async function getArenaJson() {
    await getAugmentData();
    setDefaultTitleFont();
    setDefaultDescriptionFont();
    setSelectedAugment(1);
    displayAugments(arenaJsonData);
    filterAugments();
}

async function getChampionJson() {
    await getChampionData();
    displayChampions(championJsonData);
    filterChampions();
}

async function init() {
    // Initialize drag and drop functionality
    initializeDragDrop();
    
    let p1 = getArenaJson();
    let p2 = getChampionJson();

    Promise.all([p1, p2]).then(mergeAugmentImages);
}

// Initialize the application
init();

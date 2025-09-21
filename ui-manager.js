// UI management and DOM manipulation functionality

import { 
    arenaJsonData, 
    championJsonData, 
    getItemsData, 
    getItemModifiersData,
    getCommunityDragonBaseUrl, 
    getBaseSquarePortraitPath,
    getItemIconUrl 
} from './data-manager.js';

let augmentSearch = "";
let championSearch = "";
let itemSearch = "";
let currentIconTab = "champions"; // "champions" or "items"

export function updateAugmentSearch(value) {
    augmentSearch = value;
    filterAugments();
}

export function updateChampionSearch(value) {
    championSearch = value;
    filterChampions();
}

export function updateItemSearch(value) {
    itemSearch = value;
    filterItems();
}

export function switchIconTab(tab) {
    currentIconTab = tab;
    
    // Update tab button states
    document.getElementById('championsTabBtn').classList.toggle('active', tab === 'champions');
    document.getElementById('itemsTabBtn').classList.toggle('active', tab === 'items');
    
    // Show/hide appropriate content
    document.getElementById('championsContent').style.display = tab === 'champions' ? 'block' : 'none';
    document.getElementById('itemsContent').style.display = tab === 'items' ? 'block' : 'none';
    
    // Clear search when switching tabs
    if (tab === 'champions') {
        document.getElementById('championSearchInput').value = '';
        updateChampionSearch('');
    } else {
        document.getElementById('itemSearchInput').value = '';
        updateItemSearch('');
    }
}

export function createAugmentButton(augmentData) {
    const container = document.createElement("div");
    container.setAttribute("class", "augmentButton");
    container.setAttribute("onclick", "setSelectedAugment(" + augmentData['id'] + ")");

    const augmentName = document.createElement("span");
    augmentName.innerText = augmentData['name'];
    container.appendChild(augmentName);

    const image = document.createElement("img");
    image.setAttribute("src", getCommunityDragonBaseUrl() + augmentData['iconLarge'])
    container.appendChild(image);

    return container;
}

export function displayAugments(data) {
    const augmentsHtml = data.map((augmentData) => {
        augmentData['element'] = createAugmentButton(augmentData);
        return augmentData;
    });
}

export function createChampionButton(champion) {
    const container = document.createElement("div");
    container.setAttribute("class", "augmentButton");
    container.setAttribute("onclick", "setSelectedChampion(" + champion['id'] + ")");

    const championName = document.createElement("span");
    championName.innerText = champion['name'];
    container.appendChild(championName);

    const image = document.createElement("img");
    image.setAttribute("src", getBaseSquarePortraitPath() + champion['id'] + ".png")
    container.appendChild(image);

    return container;
}

export function displayChampions(data) {
    const championsHtml = data.map((champion) => {
        champion['element'] = createChampionButton(champion);
        return champion;
    });

    console.log(championsHtml);
}

export function createItemButton(item) {
    const container = document.createElement("div");
    container.setAttribute("class", "augmentButton");
    container.setAttribute("onclick", "setSelectedItem(" + item['id'] + ")");

    const itemName = document.createElement("span");
    itemName.innerText = item['name'];
    container.appendChild(itemName);

    const image = document.createElement("img");
    image.setAttribute("src", getItemIconUrl(item['filename']));
    container.appendChild(image);

    return container;
}

export function displayItems(data) {
    const itemsHtml = data.map((item) => {
        item['element'] = createItemButton(item);
        return item;
    });
}

export function filterAugments() {
    const augmentsList = document.getElementById("augmentsList");
    augmentsList.innerHTML = "";
    if (arenaJsonData) {
        arenaJsonData.filter((e) => (e['name'].toLowerCase().includes(augmentSearch.toLowerCase()) > 0))
            .forEach((e) => augmentsList.appendChild(e.element));
    }
}

export function filterChampions() {
    const championsList = document.getElementById("championsList");
    championsList.innerHTML = "";
    if (championJsonData) {
        championJsonData.filter((e) => (e['name'].toLowerCase().includes(championSearch.toLowerCase()) > 0))
            .forEach((e) => championsList.appendChild(e.element));
    }
}

export function filterItems() {
    const itemsList = document.getElementById("itemsList");
    itemsList.innerHTML = "";
    const itemsData = getItemsData();
    if (itemsData) {
        itemsData.filter((e) => (e['name'].toLowerCase().includes(itemSearch.toLowerCase()) > 0))
            .forEach((e) => itemsList.appendChild(e.element));
    }
}

export function setDefaultTitleFont() {
    window.settings['titleFont'] = "bold 24px LolBeautfortBold";
    document.getElementById("titleFontInput").value = "bold 24px LolBeautfortBold";
}

export function setDefaultDescriptionFont() {
    window.settings['descriptionFont'] = "14px LolBeautfort";
    document.getElementById("descriptionFontInput").value = "14px LolBeautfort";
}

export function updateCanvasVariable(value, variable) {
    window.settings[variable] = value;
    window.mergeAugmentImages();
}

export function updateFrameVariable(value) {
    const borderImages = {
        augmentcard_bg: "augmentcard_bg.png",
        augmentcard_frame_silver: "augmentcard_frame_silver.png",
        augmentcard_frame_gold: "augmentcard_frame_gold.png",
        augmentcard_frame_prismatic: "augmentcard_frame_prismatic.png",
        augmentcard_sheenglow_silver: "augmentcard_sheenglow_silver.png",
        augmentcard_sheenglow_gold: "augmentcard_sheenglow_gold.png",
        augmentcard_sheenglow_prismatic: "augmentcard_sheenglow_prismatic.png",
    };
    
    window.settings['selectedFrame'] = borderImages[value];
    window.settings['shinyFrame'] = value.includes("sheenglow");
    window.mergeAugmentImages();
}

export function updateModifierVariable(value) {
    window.settings['selectedModifier'] = parseInt(value);
    window.mergeAugmentImages();
}

export function populateModifierDropdown() {
    const modifierSelect = document.getElementById('itemModifierSelect');
    const modifiers = getItemModifiersData();
    
    modifierSelect.innerHTML = '';
    modifiers.forEach(modifier => {
        const option = document.createElement('option');
        option.value = modifier.id;
        option.textContent = modifier.name;
        modifierSelect.appendChild(option);
    });
}

export function clearSearchInputs() {
    document.getElementById('augmentSearchInput').value = '';
    document.getElementById('championSearchInput').value = '';
    updateAugmentSearch('');
    updateChampionSearch('');
}

// Data management and API functionality

import { CalculationEngine } from './calculation-engine.js';

const arenaJsonDataUrl = "https://raw.communitydragon.org/pbe/cdragon/arena/";
const championJsonDataUrl = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json";
const communityDragonBaseUrl = "https://raw.communitydragon.org/pbe/game/";
const baseSquarePortraitPath = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/";

export let arenaJsonData = null;
export let championJsonData = null;

// Initialize calculation engine
const calculationEngine = new CalculationEngine();

function compareNames(a, b) {
    if (a.name < b.name){
        return -1;
    }
    if (a.name > b.name){
        return 1;
    }
    return 0;
}

export async function getAugmentData(language = 'en_us') {
    const response = await fetch(arenaJsonDataUrl + language + '.json');
    arenaJsonData = (await response.json())['augments'].sort(compareNames);
    return arenaJsonData;
}

function getChampionIcon(champion, type) {
    return communityDragonBaseUrl + "assets/characters/" + champion + "/hud/" + champion + "_" + type + ".png";
}

export async function getChampionData() {
    const response = await fetch(championJsonDataUrl);
    championJsonData = await response.json();

    championJsonData = championJsonData.filter((champion) => champion.id !== -1).sort(compareNames);

    championJsonData = championJsonData.map((champion) => {
        champion['circleIcon'] = getChampionIcon(champion['alias'].toLowerCase(), "circle");
        champion['squareIcon'] = getChampionIcon(champion['alias'].toLowerCase(), "square");
        return champion;
    });

    console.log(championJsonData);
    return championJsonData;
}

export function populateDescriptionVariables(augment) {
    let description = augment['desc'];
    const dataValues = augment['dataValues'] || {};

    // First, handle complex calculations and special placeholders using the calculation engine
    description = calculationEngine.processCalculations(description, augment);

    // Then handle simple @DataValue@ and @DataValue*multiplier@ placeholders
    while (description.includes("@")) {
        const startIndex = description.indexOf("@");
        const endIndex = description.indexOf("@", startIndex + 1);
        
        if (endIndex === -1) break; // No closing @, break to avoid infinite loop
        
        const varName = description.substring(startIndex, endIndex + 1);
        let multiplier = null;
        let asteriskIndex = null;

        // If it has a multiplier
        if (varName.includes("*")) {
            asteriskIndex = varName.indexOf("*");
            multiplier = varName.substring(asteriskIndex, varName.length - 1);
        }

        const isolatedVarName = varName.substring(1, asteriskIndex ? asteriskIndex : (varName.length - 1));

        // Check if this is a dataValue
        if (dataValues.hasOwnProperty(isolatedVarName)) {
            const processedValue = calculationEngine.processDataValue(isolatedVarName, multiplier, dataValues);
            description = description.replaceAll(varName, processedValue);
        } else {
            // If not found in dataValues, leave a descriptive placeholder
            description = description.replaceAll(varName, `[${isolatedVarName}]`);
        }
    }

    // Clean up the description
    let modifiedDescription = description.replaceAll("<br>", "\n");
    
    // Remove %i:keyword% patterns (these are internal formatting codes)
    modifiedDescription = modifiedDescription.replaceAll(/((%i:[^%]+)% )/gi, "");
    
    // Handle any remaining runtime placeholders (@f1@, @f2@, etc.)
    modifiedDescription = modifiedDescription.replaceAll(/@f(\d+)@/g, '[runtime value]');
    
    return modifiedDescription;
}

export function getAugmentById(id) {
    return arenaJsonData ? arenaJsonData.find(augment => augment.id === id) : null;
}

export function getChampionById(id) {
    return championJsonData ? championJsonData.find(champion => champion.id === id) : null;
}

export function getCommunityDragonBaseUrl() {
    return communityDragonBaseUrl;
}

export function getBaseSquarePortraitPath() {
    return baseSquarePortraitPath;
}

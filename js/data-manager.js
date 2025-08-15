// Data management and API functionality

const arenaJsonDataUrl = "https://raw.communitydragon.org/pbe/cdragon/arena/";
const championJsonDataUrl = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json";
const communityDragonBaseUrl = "https://raw.communitydragon.org/pbe/game/";
const baseSquarePortraitPath = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/";

export let arenaJsonData = null;
export let championJsonData = null;

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
    const dataValues = augment['dataValues'];

    while (description.includes("@")) {
        const startIndex = description.indexOf("@");
        const endIndex = description.indexOf("@", startIndex + 1);
        const varName = description.substring(startIndex, endIndex + 1);
        let multiplier = null;
        let asteriskIndex = null;

        // If it has a multiplier
        if (varName.includes("*")) {
            asteriskIndex = varName.indexOf("*");
            multiplier = varName.substring(asteriskIndex, varName.length - 1);
        }

        const isolatedVarName = varName.substring(1, asteriskIndex ? asteriskIndex : (varName.length - 1));

        let varValue = dataValues[isolatedVarName];

        if (multiplier) {
            // Use something safer than eval later
            varValue = eval(varValue + multiplier);
        }

        varValue = Math.fround(varValue);
        varValue = Math.floor(varValue * 100)/100;

        description = description.replaceAll(varName, varValue);
    }

    let modifiedDescription = description.replaceAll("<br>", "\n");
    return modifiedDescription.replaceAll(/((%i.+)% )/gi, "");
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

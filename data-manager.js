// Data management and API functionality

import { CalculationEngine } from './calculation-engine.js';

const arenaJsonDataUrl = "https://raw.communitydragon.org/pbe/cdragon/arena/";
const championJsonDataUrl = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json";
const communityDragonBaseUrl = "https://raw.communitydragon.org/pbe/game/";
const baseSquarePortraitPath = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/";
const itemIconsBaseUrl = "https://raw.communitydragon.org/pbe/game/assets/items/icons2d/";
const itemModifiersBaseUrl = "https://raw.communitydragon.org/pbe/game/assets/items/itemmodifiers/";

export let arenaJsonData = null;
export let championJsonData = null;
export let itemsData = null;
export let itemModifiersData = null;

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

// Items data - will be enhanced with descriptions from stringtable
let itemsDataArray = [
    { name: "Eye of the Observer", filename: "096_eye_of_the_observer.png", id: 1 },
    { name: "Boots of Speed", filename: "1001_class_t1_bootsofspeed.png", id: 2 },
    { name: "Faerie Charm", filename: "1004_class_t1_faeriecharm.png", id: 3 },
    { name: "Rejuvenation Bead", filename: "1006_tank_t1_rejuvenationbead.png", id: 4 },
    { name: "Giant's Belt", filename: "1011_class_t2_giantsbelt.png", id: 5 },
    { name: "Cloak of Agility", filename: "1018_base_t1_cloakagility.png", id: 6 },
    { name: "Blasting Wand", filename: "1026_mage_t1_blastingwand.png", id: 7 },
    { name: "Sapphire Crystal", filename: "1027_base_t1_saphirecrystal.png", id: 8 },
    { name: "Ruby Crystal", filename: "1028_base_t1_rubycrystal.png", id: 9 },
    { name: "Cloth Armor", filename: "1029_base_t1_clotharmor.png", id: 10 },
    { name: "Chain Vest", filename: "1031_base_t2_chainvest.png", id: 11 },
    { name: "Null-Magic Mantle", filename: "1033_base_t1_magicmantle.png", id: 12 },
    { name: "Emberknife", filename: "1035_alll_t1_emberknife.png", id: 13 },
    { name: "Long Sword", filename: "1036_class_t1_longsword.png", id: 14 },
    { name: "Pickaxe", filename: "1037_class_t1_pickaxe.png", id: 15 },
    { name: "B.F. Sword", filename: "1038_marksman_t1_bfsword.png", id: 16 },
    { name: "Hailblade", filename: "1039_all_t1_hailblade.png", id: 17 },
    { name: "Obsidian Edge", filename: "1040_obsidianedge.png", id: 18 },
    { name: "Dagger", filename: "1042_base_t1_dagger.png", id: 19 },
    { name: "Recurve Bow", filename: "1043_base_t2_recurvebow.png", id: 20 },
    { name: "Amplifying Tome", filename: "1052_mage_t2_amptome.png", id: 21 },
    { name: "Vampiric Scepter", filename: "1053_fighter_t2_vampiricscepter.png", id: 22 },
    { name: "Doran's Shield", filename: "1054_tank_t1_doransshield.png", id: 23 },
    { name: "Doran's Blade", filename: "1055_marksman_t1_doransblade.png", id: 24 },
    { name: "Doran's Ring", filename: "1056_mage_t1_doransring.png", id: 25 },
    { name: "Negatron Cloak", filename: "1057_tank_t2_negatroncloak.png", id: 26 },
    { name: "Needlessly Large Rod", filename: "1058_mage_t1_largerod.png", id: 27 },
    { name: "Dark Seal", filename: "1082_mage_t1_darkseal.png", id: 28 },
    { name: "Cull", filename: "1083_marksman_t1_cull.png", id: 29 },
    { name: "Scorchclaw Pup", filename: "1101_jungle_t1_scorchclawpup.png", id: 30 },
    { name: "Gustwalker Hatchling", filename: "1102_jungle_t1_gustwalkerhatchling.png", id: 31 },
    { name: "Mosstomper Seedling", filename: "1103_jungle_t1_mosstomperseedling.png", id: 32 },
    { name: "Test Item 2", filename: "1103_testitem2.png", id: 33 },
    { name: "Enchantment: Runeglaive", filename: "1402_enchantment_runeglaive.png", id: 34 },
    { name: "Turret Shielder", filename: "1504_turretshielder.png", id: 35 },
    { name: "Sudden Death", filename: "1507_tournament_suddendeath.png", id: 36 },
    { name: "Anti-Tower Socks", filename: "1508_antitowersocks.png", id: 37 },
    { name: "Gusto", filename: "1509_gusto.png", id: 38 },
    { name: "Phreakish Gusto", filename: "1510_phreakishgusto.png", id: 39 },
    { name: "Super Mech Armor", filename: "1511_supermecharmor.png", id: 40 },
    { name: "Super Mech Power Field", filename: "1512_supermechpowerfield.png", id: 41 },
    { name: "Health Potion", filename: "2003_class_t1_healthpotion.png", id: 42 },
    { name: "Total Biscuit of Everlasting Will", filename: "2010_class_t1_totalbiscuitofeverlastingwill.png", id: 43 },
    { name: "Tunneler", filename: "2012_tunneler.png", id: 44 },
    { name: "Kircheis Shard", filename: "2015_marksman_t2_kirkcheisshard.png", id: 45 },
    { name: "Steel Sigil", filename: "2019_steel_sigil.png", id: 46 },
    { name: "The Brutalizer", filename: "2020_thebrutalizer.png", id: 47 },
    { name: "Glowing Mote", filename: "2022_glowingmote.png", id: 48 },
    { name: "Sharpening Stone", filename: "2030_sharpening_stone.png", id: 49 },
    { name: "Refillable Potion", filename: "2031_class_t1_refillablepotion.png", id: 50 },
    { name: "Corrupting Potion", filename: "2033_class_t1_corruptingpotion.png", id: 51 },
    { name: "Ichor of Illumination", filename: "2048_ichorofillumination.png", id: 52 },
    { name: "Guardian's Amulet", filename: "2049_guardiansamulet.png", id: 53 },
    { name: "Sightstone", filename: "2049_sightstone.png", id: 54 },
    { name: "Guardian's Horn", filename: "2051_aram_t1_guardianshorn.png", id: 55 },
    { name: "Poro-Snax", filename: "2052_poro_snack.png", id: 56 },
    { name: "Control Ward", filename: "2055_class_t1_controlward.png", id: 57 },
    { name: "Shurelya's Battlesong", filename: "2065_enchanter_t4_shurelyasbattlesong.png", id: 58 },
    { name: "Shurelya's Battlesong", filename: "2065_tank_t4_shurelyasbattlesong.png", id: 59 },
    { name: "Elixir of Iron", filename: "2138_class_elixirofiron.png", id: 60 },
    { name: "Elixir of Iron", filename: "2138_elixir_of_iron.png", id: 61 },
    { name: "Elixir of Sorcery", filename: "2139_class_t1_elixirofsorcery.png", id: 62 },
    { name: "Elixir of Wrath", filename: "2140_class_t0_elixirofwrath.png", id: 63 },
    { name: "Stat Anvil", filename: "220000_statanvil.png", id: 64 },
    { name: "Fighter Anvil", filename: "220001_fighteranvil.png", id: 65 },
    { name: "Marksman Anvil", filename: "220002_marksmananvil.png", id: 66 },
    { name: "Assassin Anvil", filename: "220003_assassinanvil.png", id: 67 },
    { name: "Mage Anvil", filename: "220004_mageanvil.png", id: 68 },
    { name: "Tank Anvil", filename: "220005_tankanvil.png", id: 69 },
    { name: "Support Anvil", filename: "220006_supportanvil.png", id: 70 },
    { name: "Prismatic Anvil", filename: "220007_prismaticanvil.png", id: 71 },
    { name: "Sack of Gold", filename: "2319_sackofgold.png", id: 72 },
    { name: "Minion Dematerializer", filename: "2403_minion_dematerializer.png", id: 73 },
    { name: "Shattered Armguard", filename: "2420_shatteredarmguard.png", id: 74 },
    { name: "Slightly Magical Boots", filename: "2422_class_t1_slightlymagicalboots.png", id: 75 },
    { name: "Unending Despair", filename: "2502_unendingdespair.png", id: 76 },
    { name: "Blackfire Torch", filename: "2503_blackfiretorch64.png", id: 77 },
    { name: "Kaenic Rookern", filename: "2504_kaenicrookern.png", id: 78 },
    { name: "Fated Ashes", filename: "2508_fatedashes64.png", id: 79 },
    { name: "Abyssal Scepter", filename: "3001_abyssal_scepter.png", id: 80 },
    { name: "Lunari Support", filename: "3001_support_lunari.png", id: 81 },
    { name: "Trailblazer", filename: "3002_trailblazer.png", id: 82 },
    { name: "Archangel's Staff", filename: "3003_mage_t3_archangelstaff.png", id: 83 },
    { name: "Manamune", filename: "3004_marksman_t3_manamune.png", id: 84 },
    { name: "Atma's Reckoning", filename: "3005_fighter_t3_atmasreckoning.png", id: 85 },
    { name: "Berserker's Greaves", filename: "3006_class_t2_berserkersgreaves.png", id: 86 },
    { name: "Boots of Swiftness", filename: "3009_class_t2_bootsofswiftness.png", id: 87 },
    { name: "Void Boots", filename: "3010_voidboots.png", id: 88 },
    { name: "Voidwalkers", filename: "3010_voidwalkers.png", id: 89 },
    { name: "Chemtech Fumigator", filename: "3011_enchanter_t3_chemtechfumigator.png", id: 90 },
    { name: "Blessed Chalice", filename: "3012_blessed_chalice.png", id: 91 },
    { name: "Sorcerer's Shoes", filename: "3020_class_t2_sorcerersshoes.png", id: 92 },
    { name: "Frozen Mallet", filename: "3022_frozen_mallet.png", id: 93 },
    { name: "Lifewell Pendant", filename: "3023_lifewell_pendant.png", id: 94 },
    { name: "Glacial Shroud", filename: "3024_tank_t2_glacialshroud.png", id: 95 },
    { name: "Guardian Angel", filename: "3026_fighter_t3_guardianangel.png", id: 96 },
    { name: "Infinity Edge", filename: "3031_marksman_t3_infinityedge.png", id: 97 },
    { name: "Innervating Locket", filename: "3032_innervating_locket.png", id: 98 },
    { name: "Yun Tal Wildarrows", filename: "3032_yuntalwildarrows.png", id: 99 },
    { name: "Mortal Reminder", filename: "3033_marksman_t3_mortalreminder.png", id: 100 },
    { name: "Kenyu's Kukri", filename: "3034_kenyus_kukri.png", id: 101 },
    { name: "Last Whisper", filename: "3035_marksman_t2_lastwhisper.png", id: 102 },
    { name: "Lord Dominik's Regards", filename: "3036_marksman_t3_dominikregards.png", id: 103 },
    { name: "Mejai's Soulstealer", filename: "3041_mage_t2_mejaissoulstealer.png", id: 104 },
    { name: "Muramana", filename: "3042_marksman_t3_muramana.png", id: 105 },
    { name: "Netherrift Armor", filename: "3042_netherrift_armor.png", id: 106 },
    { name: "Phage", filename: "3044_fighter_t2_phage.png", id: 107 },
    { name: "Phantom Dancer", filename: "3046_marksman_t3_phantomdancer.png", id: 108 },
    { name: "Plated Steelcaps", filename: "3047_class_t2_ninjatabi.png", id: 109 },
    { name: "Seraph's Embrace", filename: "3048_mage_t3_seraphsembrace.png", id: 110 },
    { name: "Zeke's Convergence", filename: "3050_enchanter_t3_zekesconvergence.png", id: 111 },
    { name: "Axe of Avarosa", filename: "3051_fighter_t2_axeofavarosa.png", id: 112 },
    { name: "Sterak's Gage", filename: "3053_steraks_gage.png", id: 113 },
    { name: "Silversteel Talons", filename: "3054_silversteeltalons.png", id: 114 },
    { name: "Fulmination", filename: "3055_fulmination.png", id: 115 },
    { name: "Demon King's Crown", filename: "3056_demonkingscrown.png", id: 116 },
    { name: "Ohmwrecker", filename: "3056_ohmwrecker.png", id: 117 },
    { name: "Sheen", filename: "3057_fighter_t2_sheen.png", id: 118 },
    { name: "Shield of Molten Stone", filename: "3058_shieldofmoltenstone.png", id: 119 },
    { name: "Cloak of Starry Night", filename: "3059_cloakofstarrynight.png", id: 120 },
    { name: "Force of Entropy", filename: "3061_forceofentropy.png", id: 121 },
    { name: "Sanguine Gift", filename: "3062_sanguinegift.png", id: 122 },
    { name: "Elisha's Miracle", filename: "3063_elishasmiracle.png", id: 123 },
    { name: "Spike the Ripper", filename: "3064_spike_the_ripper.png", id: 124 },
    { name: "Talisman of Ascension", filename: "3064_talismanofascension.png", id: 125 },
    { name: "Spirit Visage", filename: "3065_tank_t3_spiritvisage.png", id: 126 },
    { name: "Winged Moonplate", filename: "3066_tank_t3_wingedmoonplate.png", id: 127 },
    { name: "Kindlegem", filename: "3067_tank_t1_kindlegem.png", id: 128 },
    { name: "Sunfire Aegis", filename: "3068_tank_t4_sunfireaegis.png", id: 129 },
    { name: "Hamstringer", filename: "3069_hamstringer.png", id: 130 },
    { name: "Tear of the Goddess", filename: "3070_all_t1_tearofthegoddess.png", id: 131 },
    { name: "Black Cleaver", filename: "3071_fighter_t3_blackcleaver.png", id: 132 },
    { name: "Bloodthirster", filename: "3072_fighter_t3_bloodthirster.png", id: 133 },
    { name: "Hexaegis", filename: "3073_hexaegis.png", id: 134 },
    { name: "Ravenous Hydra", filename: "3074_fighter_t3_ravenoushydra.png", id: 135 },
    { name: "Thornmail", filename: "3075_tank_t3_thornmail.png", id: 136 },
    { name: "Bramble Vest", filename: "3076_tank_t2_bramblevest.png", id: 137 },
    { name: "Tiamat", filename: "3077_fighter_t2_tiamat.png", id: 138 },
    { name: "Trinity Force", filename: "3078_fighter_t4_trinityforce.png", id: 139 },
    { name: "Warden's Mail", filename: "3082_tank_t2_wardensmail.png", id: 140 },
    { name: "Warmog's Armor", filename: "3083_tank_t3_warmogs.png", id: 141 },
    { name: "Heartsteel", filename: "3084_tank_t4_heartsteel.png", id: 142 },
    { name: "Runaan's Hurricane", filename: "3085_marksman_t3_runaans.png", id: 143 },
    { name: "Zeal", filename: "3086_fighter_t2_zeal.png", id: 144 },
    { name: "Statikk Shiv", filename: "3087_statikk_shiv.png", id: 145 },
    { name: "Rabadon's Deathcap", filename: "3089_mage_t3_deathcap.png", id: 146 },
    { name: "Wit's End", filename: "3091_fighter_t3_witsend.png", id: 147 },
    { name: "Rapid Firecannon", filename: "3094_marksman_t3_rapidfirehandcannon.png", id: 148 },
    { name: "Windblade", filename: "3095_windblade.png", id: 149 },
    { name: "Lich Bane", filename: "3100_mage_t3_lichbane.png", id: 150 },
    { name: "Banshee's Veil", filename: "3102_mage_t3_bansheesveil.png", id: 151 },
    { name: "Aegis of the Legion", filename: "3105_tank_t2_aegisofthelegion.png", id: 152 },
    { name: "Redemption", filename: "3107_enchanter_t3_redemption.png", id: 153 },
    { name: "Fiendish Codex", filename: "3108_mage_t2_fiendishcodex.png", id: 154 },
    { name: "Knight's Vow", filename: "3109_tank_t3_knightsvow.png", id: 155 },
    { name: "Frozen Heart", filename: "3110_tank_t3_frozenheart.png", id: 156 },
    { name: "Mercury's Treads", filename: "3111_class_t2_mercurystreads.png", id: 157 },
    { name: "Guardian's Orb", filename: "3112_aram_t1_guardiansorb.png", id: 158 },
    { name: "Aether Wisp", filename: "3113_mage_t2_aetherwisp.png", id: 159 },
    { name: "Forbidden Idol", filename: "3114_mage_t2_forbiddenidol.png", id: 160 },
    { name: "Nashor's Tooth", filename: "3115_mage_t3_nashorstooth.png", id: 161 },
    { name: "Rylai's Crystal Scepter", filename: "3116_mage_t3_rylajscrystalscepter.png", id: 162 },
    { name: "Boots of Mobility", filename: "3117_class_t2_bootsofmobility.png", id: 163 },
    { name: "Malignance", filename: "3118_malignance.png", id: 164 },
    { name: "Winter's Approach", filename: "3119_wintersapproach.png", id: 165 },
    { name: "Fimbulwinter", filename: "3121_fimbulwinter.png", id: 166 },
    { name: "Executioner's Calling", filename: "3123_fighter_t2_executionerscalling.png", id: 167 },
    { name: "Guinsoo's Rageblade", filename: "3124_marksman_t3_guinsoosrageblade.png", id: 168 },
    { name: "Deathfire Grasp", filename: "3128_deathfire_grasp.png", id: 169 },
    { name: "Sword of the Divine", filename: "3131_fighter_t3_swordofthedivine.png", id: 170 },
    { name: "Caulfield's Warhammer", filename: "3133_fighter_t2_caulfieldswarhammer.png", id: 171 },
    { name: "Serrated Dirk", filename: "3134_assassin_t2_serrateddirk.png", id: 172 },
    { name: "Void Staff", filename: "3135_mage_t3_voidstaff.png", id: 173 },
    { name: "Cryptbloom", filename: "3137_cryptbloom.png", id: 174 },
    { name: "Mercurial Scimitar", filename: "3139_marksman_t3_mercurialscimitar.png", id: 175 },
    { name: "Quicksilver Sash", filename: "3140_marksman_t2_quicksilversash.png", id: 176 },
    { name: "Youmuu's Ghostblade", filename: "3142_assassin_t3_youmuusghostblade.png", id: 177 },
    { name: "Randuin's Omen", filename: "3143_tank_t3_randuinsomen.png", id: 178 },
    { name: "Scout's Slingshot", filename: "3144_scoutslingshot.png", id: 179 },
    { name: "Hextech Alternator", filename: "3145_mage_t2_hextechalternator.png", id: 180 },
    { name: "Hextech Gunblade", filename: "3146_hextechgunblade.png", id: 181 },
    { name: "Haunting Guise", filename: "3147_hauntingguise.png", id: 182 },
    { name: "Hextech Rocketbelt", filename: "3152_mage_t4_hextechrocketbelt.png", id: 183 },
    { name: "Blade of the Ruined King", filename: "3153_fighter_t3_bladeoftheruinedking.png", id: 184 },
    { name: "Wriggle's Lantern", filename: "3154_wriggleslantern.png", id: 185 },
    { name: "Hexdrinker", filename: "3155_fighter_t2_hexdrinker.png", id: 186 },
    { name: "Maw of Malmortius", filename: "3156_fighter_t3_mawofmalmortius.png", id: 187 },
    { name: "Zhonya's Hourglass", filename: "3157_mage_t3_zhonyashourglass.png", id: 188 },
    { name: "Ionian Boots of Lucidity", filename: "3158_class_t2_ionianbootsoflucidity.png", id: 189 },
    { name: "Spear of Shojin", filename: "3161_fighter_t3_spearofshojin.png", id: 190 },
    { name: "Morellonomicon", filename: "3165_mage_t3_morellonomicon.png", id: 191 },
    { name: "Zephyr", filename: "3172_zephyr.png", id: 192 },
    { name: "Guardian's Blade", filename: "3177_aram_t1_guardiansblade.png", id: 193 },
    { name: "Guardian's Hammer", filename: "3177_aram_t1_guardianshammer.png", id: 194 },
    { name: "Umbral Glaive", filename: "3179_assassin_t3_umbralglaive.png", id: 195 },
    { name: "Hullbreaker", filename: "3181_hullbreaker.png", id: 196 },
    { name: "Sanguine Blade", filename: "3181_sanguineblade.png", id: 197 },
    { name: "Locket of the Iron Solari", filename: "3190_enchanter_t4_locketofironsolari.png", id: 198 },
    { name: "Seeker's Armguard", filename: "3191_battlemage_t2_seekersarmguard.png", id: 199 },
    { name: "Gargoyle Stoneplate (Old)", filename: "3193_gargoyle_stoneplate.png", id: 200 },
    { name: "Gargoyle Stoneplate", filename: "3193_tank_t3_gargoylestoneplate.png", id: 201 },
    { name: "Battlemage Blocker", filename: "3194_battlemage_blocker.png", id: 202 },
    { name: "Hexcore 2", filename: "3196_hexcore2.png", id: 203 },
    { name: "Hexcore 3", filename: "3197_hexcore3.png", id: 204 },
    { name: "Hexcore 4", filename: "3198_hexcore4.png", id: 205 },
    { name: "Spectre's Cowl", filename: "3211_tank_t2_spectrescowl.png", id: 206 },
    { name: "Mikael's Blessing", filename: "3222_enchanter_t3_mikaelsblessing.png", id: 207 },
    { name: "Terminus", filename: "3302_terminus.png", id: 208 },
    { name: "Stealth Ward", filename: "3340_class_t1_wardingtotem.png", id: 209 },
    { name: "Arcane Sweeper", filename: "3348_arcanesweeper.png", id: 210 },
    { name: "Farsight Alteration", filename: "3363_class_t1_farsightalteration.png", id: 211 },
    { name: "Oracle Lens", filename: "3364_class_t1_oracleslens.png", id: 212 },
    { name: "The Forge Cleaver", filename: "3380_the_forge_cleaver.png", id: 213 },
    { name: "Wooglet's Witchcap", filename: "3385_forge_wooglets_witchcap.png", id: 214 },
    { name: "Bonetooth Necklace R", filename: "3406_bonetooth_necklace_r_2.png", id: 215 },
    { name: "Bonetooth Necklace G", filename: "3417_bonetooth_necklace_g_1.png", id: 216 },
    { name: "Rite of Ruin", filename: "3430_riteofruin.png", id: 217 },
    { name: "ASC Trinket", filename: "3460_asc_trinket.png", id: 218 },
    { name: "Ardent Censer", filename: "3504_enchanter_t3_ardentcenser.png", id: 219 },
    { name: "Essence Reaver", filename: "3508_marksman_t3_essencereaver.png", id: 220 },
    { name: "ZZ'Rot Portal", filename: "3512_zzrot_portal.png", id: 221 },
    { name: "Eye of the Herald", filename: "3513_eyeoftheherald.png", id: 222 },
    { name: "Kalista's Passive Item", filename: "3599_kalistapassiveitem.png", id: 223 },
    { name: "Black Spear", filename: "3600_champ_t0_blackspear.png", id: 224 },
    { name: "Laser Affix", filename: "3634_laser_affix.png", id: 225 },
    { name: "Spicy Snax", filename: "3681_spicysnax.png", id: 226 },
    { name: "Rainbow Snax", filename: "3683_rainbowsnax.png", id: 227 },
    { name: "Dead Man's Plate", filename: "3742_tank_t3_deadmansplate.png", id: 228 },
    { name: "Staff of Flowing Water", filename: "3744_enchanter_t3_staffofflowingwater.png", id: 229 },
    { name: "Titanic Hydra", filename: "3748_fighter_t3_titanichydra.png", id: 230 },
    { name: "Titanic Hydra (Old)", filename: "3748_titanic_hydra.png", id: 231 },
    { name: "Bami's Cinder", filename: "3751_bamis_cinder.png", id: 232 },
    { name: "Crystalline Bracer", filename: "3801_tank_t2_crystallinebracer.png", id: 233 },
    { name: "Lost Chapter", filename: "3802_mage_tier2_lostchapter.png", id: 234 },
    { name: "Catalyst of Aeons", filename: "3803_mage_t2_catalystofaeons.png", id: 235 },
    { name: "Edge of Night", filename: "3814_assassin_t3_edgeofnight.png", id: 236 },
    { name: "Spellthief's Edge", filename: "3850_mage_t1_spellthiefsedge.png", id: 237 },
    { name: "Frostfang", filename: "3851_mage_t2_frostfang.png", id: 238 },
    { name: "Shard of True Ice", filename: "3853_mage_t3_shardoftrueice.png", id: 239 },
    { name: "Petricide Shoulderguard", filename: "3854_tank_t1_petriciteshoulderguard.png", id: 240 },
    { name: "Runesteel Spaulders", filename: "3855_tank_t2_runesteelspaulders.png", id: 241 },
    { name: "Pauldrons of Whiterock", filename: "3857_tank_t3_pauldronsofwhiterock.png", id: 242 },
    { name: "Relic Shield", filename: "3858_tank_t1_relicshield.png", id: 243 },
    { name: "Targon's Buckler", filename: "3859_tank_t2_targonsbucker.png", id: 244 },
    { name: "Bulwark of the Mountain", filename: "3860_tank_t3_bulwarkofthemountain.png", id: 245 },
    { name: "Spectral Sickle", filename: "3862_marksman_t1_spectralsickle.png", id: 246 },
    { name: "Harrowing Crescent", filename: "3863_marksman_t2_harrowingcrescent.png", id: 247 },
    { name: "Black Mist Scythe", filename: "3864_marksman_t3_blackmistscythe.png", id: 248 },
    { name: "World Atlas", filename: "3865_worldatlas.png", id: 249 },
    { name: "Runic Compass", filename: "3866_runiccompass.png", id: 250 },
    { name: "Bounty of Worlds", filename: "3867_bountyofworlds.png", id: 251 },
    { name: "Celestial Opposition", filename: "3869_celestialopposition.png", id: 252 },
    { name: "Dreammaker", filename: "3870_dreammaker.png", id: 253 },
    { name: "Zaz'Zak's Realmspike", filename: "3871_zazzaksrealmspike.png", id: 254 },
    { name: "Solstice Sleigh", filename: "3876_solticesleigh.png", id: 255 },
    { name: "Bloodsong", filename: "3877_bloodsong.png", id: 256 },
    { name: "Fire at Will Circle", filename: "3901_champ_t0_fireatwillcircle.png", id: 257 },
    { name: "Death's Daughter Circle", filename: "3902_champ_t0_deathsdaughtercircle.png", id: 258 },
    { name: "Raise Morale Circle", filename: "3903_champ_t0_raisemoralecircle.png", id: 259 },
    { name: "Gangplank R3", filename: "3903_gangplankr3.png", id: 260 },
    { name: "Oblivion Orb", filename: "3916_mage_t2_oblivionorb.png", id: 261 },
    { name: "Ghostwalkers", filename: "4001_ghostwalkers.png", id: 262 },
    { name: "Lifeline", filename: "4003_assassin_t2_lifeline.png", id: 263 },
    { name: "Spectral Cutlass", filename: "4004_assassin_t3_spectralcutlass.png", id: 264 },
    { name: "Imperial Mandate", filename: "4005_enchanter_t4_imperialmandate.png", id: 265 },
    { name: "Bloodletter's Veil", filename: "4010_bloodlettersveil.png", id: 266 },
    { name: "Sword of Blossoming Dawn", filename: "4011_swordofblossomingdawn.png", id: 267 },
    { name: "Sin Eater", filename: "4012_sineater.png", id: 268 },
    { name: "Lightning Braid", filename: "4013_lightning_braid.png", id: 269 },
    { name: "Perplexity", filename: "4015_perplexity.png", id: 270 },
    { name: "Wordless Promise", filename: "4016_wordlesspromise.png", id: 271 },
    { name: "Hellfire Hatchet", filename: "4017_hellfirehatchet.png", id: 272 },
    { name: "Force of Nature", filename: "4401_tank_t3_forceofnature.png", id: 273 },
    { name: "Golden Spatula", filename: "4403_goldenspatula.png", id: 274 },
    { name: "Twin Masks", filename: "443080_twinmasks.png", id: 275 },
    { name: "Hexbolt Companion", filename: "443081_hexboltcompanion.png", id: 276 },
    { name: "Reaper's Toll", filename: "443090_reaperstoll.png", id: 277 },
    { name: "Reverberation", filename: "447114_reverberation.png", id: 278 },
    { name: "Regicide", filename: "447115_regicide.png", id: 279 },
    { name: "Kinkou Jitte", filename: "447116_kinkoujitte.png", id: 280 },
    { name: "Pyromancer's Cloak", filename: "447118_pyromancerscloak.png", id: 281 },
    { name: "Lightning Rod", filename: "447119_lightningrod.png", id: 282 },
    { name: "Diamond-Tipped Spear", filename: "447120_diamondtippedspear.png", id: 283 },
    { name: "Twilight's Edge", filename: "447121_twilightsedge.png", id: 284 },
    { name: "Black Hole Gauntlet", filename: "447122_blackholegauntlet.png", id: 285 },
    { name: "Puppeteer", filename: "447123_puppeteer.png", id: 286 },
    { name: "Horizon Focus", filename: "4628_mage_t3_horizonfocus.png", id: 287 },
    { name: "Cosmic Drive", filename: "4629_mage_t3_cosmicdrive.png", id: 288 },
    { name: "Void Crystal", filename: "4630_mage_t2_voidcrystal.png", id: 289 },
    { name: "Verdant Barrier", filename: "4632_tank_t2_verdantbarrier.png", id: 290 },
    { name: "Riftmaker", filename: "4633_mage_t4_riftmaker.png", id: 291 },
    { name: "Leeching Leer", filename: "4635_mage_t2_leechingleer.png", id: 292 },
    { name: "Night Harvester", filename: "4636_mage_t4_nightharvester.png", id: 293 },
    { name: "Demonic Embrace", filename: "4637_mage_t3_demonicembrace.png", id: 294 },
    { name: "Watchful Sightstone", filename: "4638_enchanter_t3_watchfulsightstone.png", id: 295 },
    { name: "Stirring Sightstone", filename: "4641_enchanter_t2_stirringsightstone.png", id: 296 },
    { name: "Bandleglass Mirror", filename: "4642_enchanter_t2_bandleglassmirror.png", id: 297 },
    { name: "Vigilant Sightstone", filename: "4643_enchanter_t3_vigilantsightstone.png", id: 298 },
    { name: "Crown of the Shattered Queen", filename: "4644_crown.png", id: 299 },
    { name: "Shadowflame", filename: "4645_shadowflame.png", id: 300 },
    { name: "Stormsurge", filename: "4646_stormsurge.png", id: 301 },
    { name: "Iron Spike Whip", filename: "6029_fighter_t2_ironspikewhip.png", id: 302 },
    { name: "Cruelty", filename: "6035_fighter_t3_silvermeredawn.png", id: 303 },
    { name: "Death's Dance", filename: "6333_fighter_t3_deathsdance.png", id: 304 },
    { name: "Chempunk Chainsword", filename: "6609_fighter_t3_chempunkchainsword.png", id: 305 },
    { name: "Sundered Sky", filename: "6610_sunderedsky.png", id: 306 },
    { name: "Moonstone Renewer", filename: "6617_enchanter_t4_moonstonerenewer.png", id: 307 },
    { name: "Echoes of Helia", filename: "6620_echoes_of_helia.png", id: 308 },
    { name: "Dawncore", filename: "6621_dawncore.png", id: 309 },
    { name: "Goredrinker", filename: "6630_fighter_t4_goredrinker.png", id: 310 },
    { name: "Stridebreaker", filename: "6631_fighter_t4_stridebreaker.png", id: 311 },
    { name: "Divine Devourer", filename: "6632_fighter_t4_divinedevourer.png", id: 312 },
    { name: "Liandry's Anguish", filename: "6653_mage_t4_liandrysanguish.png", id: 313 },
    { name: "Caster's Companion", filename: "6655_casterscompanion.png", id: 314 },
    { name: "Everfrost", filename: "6656_mage_t4_everfrost.png", id: 315 },
    { name: "Rod of Ages", filename: "6657_mage_t4_rodofages.png", id: 316 },
    { name: "Bami's Cinder", filename: "6660_tank_t2_bamiscinder.png", id: 317 },
    { name: "Iceborn Gauntlet", filename: "6662_tank_t3_iceborngauntlet.png", id: 318 },
    { name: "Hollow Radiance", filename: "6664_hollowradiance.png", id: 319 },
    { name: "Chemtech Purifier", filename: "6664_tank_t4_acceleratedchemtank.png", id: 320 },
    { name: "Jak'Sho, The Protean", filename: "6665_tank_t4_jakshotheprotean.png", id: 321 },
    { name: "Radiant Virtue", filename: "6667_tank_t4_radiantvirtue.png", id: 322 },
    { name: "Noonquiver", filename: "6670_marksman_t2_noonquiver.png", id: 323 },
    { name: "Galeforce", filename: "6671_marksman_t4_galeforce.png", id: 324 },
    { name: "Kraken Slayer", filename: "6672_marksman_t4_behemothslayer.png", id: 325 },
    { name: "Immortal Shieldbow", filename: "6673_marksman_t4_crimsonshieldbow.png", id: 326 },
    { name: "Navori Quickblades", filename: "6675_marksman_t3_navoriquickblades.png", id: 327 },
    { name: "Navori Flickerblade", filename: "6675_navoriflickerblade.png", id: 328 },
    { name: "The Collector", filename: "6676_marksman_t3_thecollector.png", id: 329 },
    { name: "Rage Knife", filename: "6677_marksman_t2_rageknife.png", id: 330 },
    { name: "Rectrix", filename: "6690_rectrix.png", id: 331 },
    { name: "Duskblade of Draktharr", filename: "6691_assassin_t4_duskbladeofdraktharr.png", id: 332 },
    { name: "Eclipse", filename: "6692_assassin_t4_eclipse.png", id: 333 },
    { name: "Prowler's Claw", filename: "6693_assassin_t4_prowlersclaw.png", id: 334 },
    { name: "Serylda's Grudge", filename: "6694_assasin_t3_seryldasgrudge.png", id: 335 },
    { name: "Serpent's Fang", filename: "6695_assassin_t3_serpentsfang.png", id: 336 },
    { name: "Axiom Arc", filename: "6696_axiomarc.png", id: 337 },
    { name: "Hubris", filename: "6697_hubris.png", id: 338 },
    { name: "Profane Hydra", filename: "6698_profanehydra.png", id: 339 },
    { name: "Voltaic Cyclosword", filename: "6699_voltaiccyclosword.png", id: 340 },
    { name: "Aegis", filename: "6700_aegis.png", id: 341 },
    { name: "Icon", filename: "6701_icon.png", id: 342 },
    { name: "Opportunity", filename: "6701_opportunity.png", id: 343 },
    { name: "Oracle Lens (Brawl)", filename: "6702_class_t1_oracleslens.brawl.png", id: 344 },
    { name: "Ornn Claws", filename: "7000_ornn_claws.png", id: 345 },
    { name: "Ornn Glory", filename: "7003_ornn_glory.png", id: 346 },
    { name: "Mirage Blade", filename: "7100_mirageblade.png", id: 347 },
    { name: "Gambler's Blade", filename: "7101_gamblers_blade.png", id: 348 },
    { name: "Reality Fracture", filename: "7102_realityfracture.png", id: 349 },
    { name: "Hemomancer's Helm", filename: "7103_hemomancershelm.png", id: 350 },
    { name: "Angelic Promise", filename: "7105_angelicpromise.png", id: 351 },
    { name: "Dragonheart", filename: "7106_dragonheart.png", id: 352 },
    { name: "Decapitator", filename: "7107_decapitator.png", id: 353 },
    { name: "Runecarver", filename: "7108_runecarver.png", id: 354 },
    { name: "Moonflair Spellblade", filename: "7110_moonflairspellblade.png", id: 355 },
    { name: "Overlord's Bloodmail", filename: "7111_overlordsbloodmail.png", id: 356 },
    { name: "Flesh Eater", filename: "7112_flesheater.png", id: 357 },
    { name: "Detonation Orb", filename: "7113_detonationorb.png", id: 358 },
    { name: "Anathema's Chains", filename: "8001_tank_t3_anathemaschains.png", id: 359 },
    { name: "Abyssal Mask", filename: "8020_tank_t3_abyssalmask.png", id: 360 },
    { name: "Scatter Arrows", filename: "9190_scatterarrows.strawberryrebuild.png", id: 361 },
    { name: "Berserker's Greaves T3", filename: "boots_tier3_berserkersgreaves_64.png", id: 362 },
    { name: "Ionian Boots T3", filename: "boots_tier3_ionianboots_64.png", id: 363 },
    { name: "Mercury's Treads T3", filename: "boots_tier3_mercury_64.png", id: 364 },
    { name: "Plated Steelcaps T3", filename: "boots_tier3_platedsteelcaps_64.png", id: 365 },
    { name: "Sorcerer's Shoes T3", filename: "boots_tier3_sorceror_64.png", id: 366 },
    { name: "Boots of Swiftness T3", filename: "boots_tier3_swiftness_64.png", id: 367 },
    { name: "Synchronized Souls T3", filename: "boots_tier3_syncronisedsouls_64.png", id: 368 },
    { name: "Elixir of Avarice", filename: "elixir_of_avarice.png", id: 369 },
    { name: "Elixir of Force", filename: "elixir_of_force.png", id: 370 },
    { name: "Fiddlesticks Trinket", filename: "fiddlestickstrinket1.png", id: 371 },
    { name: "GP UI Placeholder", filename: "gp_ui_placeholder.png", id: 372 },
    { name: "Soul Juice AP/AD", filename: "icon_item_souljuice_abilitypowerattackdamage.png", id: 373 },
    { name: "Soul Juice Fun Hat", filename: "icon_item_souljuice_funhat.png", id: 374 },
    { name: "Icon Stat AR", filename: "icon_stat_ar.png", id: 375 },
    { name: "Soul Juice Green", filename: "icons_souljuice_green.png", id: 376 },
    { name: "Soul Juice Yellow", filename: "icons_souljuice_yellow.png", id: 377 },
    { name: "Shop Reroll", filename: "item_consumable_shopreroll.png", id: 378 },
    { name: "Orbital Laser", filename: "orbital_laser.png", id: 379 },
    { name: "Pyke Gold", filename: "pykegold.png", id: 380 },
    { name: "Radiant Virtue", filename: "radiantvirtue.png", id: 381 },
    { name: "Stealth Ward Item", filename: "stealth_ward_29_item.png", id: 382 },
    { name: "Teleport Home", filename: "teleporthome.png", id: 383 },
    { name: "Teleport Home Disabled", filename: "teleporthomedisabled.png", id: 384 }
];

// Item modifiers data
const itemModifiersDataArray = [
    { name: "None", filename: "", id: 0 },
    { name: "Blood Moon Modifier", filename: "bloodmoonmodifier.png", id: 1 },
    { name: "Border Treatment Mythic", filename: "bordertreatmentmythic.png", id: 2 },
    { name: "Border Treatment Ornn", filename: "bordertreatmentornn.png", id: 3 },
    { name: "Border Treatment Prismatic", filename: "bordertreatmentprismatic.png", id: 4 },
    { name: "Gold Corners Overlay", filename: "goldcornersoverlay.png", id: 5 },
    { name: "Noxus Item Border", filename: "noxus_item_border_.png", id: 6 },
    { name: "Strawberry Weapon Evolve Border", filename: "strawberry_weapon_evolve_border.png", id: 7 },
    { name: "Weirding Witch Hat", filename: "weirdingwitchat.png", id: 8 }
];

export function getItemsData() {
    if (!itemsData) {
        itemsData = itemsDataArray.sort(compareNames);
    }
    return itemsData;
}

export function getItemModifiersData() {
    if (!itemModifiersData) {
        itemModifiersData = itemModifiersDataArray;
    }
    return itemModifiersData;
}

export function getItemById(id) {
    const items = getItemsData();
    return items ? items.find(item => item.id === id) : null;
}

export function getItemModifierById(id) {
    const modifiers = getItemModifiersData();
    return modifiers ? modifiers.find(modifier => modifier.id === id) : null;
}

export function getItemIconUrl(filename) {
    return itemIconsBaseUrl + filename;
}

export function getItemModifierUrl(filename) {
    return filename ? itemModifiersBaseUrl + filename : null;
}


// Keep the original function for backward compatibility
export async function fetchItemDescriptions() {
    const stringtableUrl = "https://raw.communitydragon.org/pbe/game/en_us/data/menu/en_us/lol.stringtable.json";
    
    try {
        console.log("Fetching item descriptions from stringtable...");
        const response = await fetch(stringtableUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const entries = data.entries || {};
        
        let foundDescriptions = 0;
        let foundBriefs = 0;
        
        // Process each item in the array
        itemsDataArray.forEach(item => {
            // Extract code from filename
            const code = extractItemCode(item.filename);
            item.code = code;
            
            if (code) {
                // Look for summary (description) with 44 prefix
                const summaryKey = `item_44${code}_summary`;
                if (entries[summaryKey]) {
                    item.description = entries[summaryKey];
                    foundDescriptions++;
                }
                
                // Look for brief (flavor text) with 44 prefix
                const briefKey = `item_44${code}_brief`;
                if (entries[briefKey]) {
                    item.brief = entries[briefKey];
                    foundBriefs++;
                }
            }
        });
        
        console.log(`Item descriptions loaded: ${foundDescriptions} descriptions, ${foundBriefs} briefs found out of ${itemsDataArray.length} items`);
        
        // Reset itemsData to null so it gets regenerated with new data
        itemsData = null;
        
        return {
            totalItems: itemsDataArray.length,
            itemsWithCodes: itemsDataArray.filter(item => item.code).length,
            descriptionsFound: foundDescriptions,
            briefsFound: foundBriefs
        };
        
    } catch (error) {
        console.error("Error fetching item descriptions:", error);
        
        // Still add codes even if fetch fails
        itemsDataArray.forEach(item => {
            const code = extractItemCode(item.filename);
            item.code = code;
        });
        
        // Reset itemsData to null so it gets regenerated with codes
        itemsData = null;
        
        return {
            error: error.message,
            totalItems: itemsDataArray.length,
            itemsWithCodes: itemsDataArray.filter(item => item.code).length,
            descriptionsFound: 0,
            briefsFound: 0
        };
    }
}

// Preset management functionality

// Default preset (hard-coded, always available)
const DEFAULT_PRESET = {
    name: "Default",
    settings: {
        titleFont: "bold 24px LolBeautfortBold",
        descriptionFont: "14px LolBeautfort",
        iconYOffset: 40,
        titleYOffset: 324,
        descriptionYOffset: 364,
        iconXOffset: 156,
        iconSize: 150,
        titleLineHeight: 26,
        descriptionLineHeight: 18
    }
};

export class PresetManager {
    constructor() {
        this.currentPresetName = 'Default';
    }

    // Get all presets (including default)
    getAllPresets() {
        const customPresets = this.getCustomPresets();
        return [DEFAULT_PRESET, ...customPresets];
    }

    // Get only custom presets from localStorage
    getCustomPresets() {
        try {
            const stored = localStorage.getItem('augmentBuilder_presets');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load presets:', e);
            return [];
        }
    }

    // Save custom presets to localStorage
    saveCustomPresets(presets) {
        try {
            localStorage.setItem('augmentBuilder_presets', JSON.stringify(presets));
            return true;
        } catch (e) {
            console.error('Failed to save presets:', e);
            return false;
        }
    }

    // Get current preset name
    getCurrentPresetName() {
        try {
            const stored = localStorage.getItem('augmentBuilder_currentPreset');
            return stored || 'Default';
        } catch (e) {
            return 'Default';
        }
    }

    // Set current preset name
    setCurrentPresetName(name) {
        try {
            localStorage.setItem('augmentBuilder_currentPreset', name);
            this.currentPresetName = name;
        } catch (e) {
            console.error('Failed to save current preset:', e);
        }
    }

    // Get preset by name
    getPresetByName(name) {
        const allPresets = this.getAllPresets();
        return allPresets.find(preset => preset.name === name);
    }

    // Save current settings as a new preset
    saveAsNewPreset(name, currentSettings) {
        if (!name || name.trim() === '') {
            return { success: false, error: 'Preset name cannot be empty' };
        }

        if (name === 'Default') {
            return { success: false, error: 'Cannot use "Default" as preset name' };
        }

        const customPresets = this.getCustomPresets();
        
        // Check if name already exists
        if (customPresets.some(preset => preset.name === name)) {
            return { success: false, error: 'Preset name already exists' };
        }

        const newPreset = {
            name: name,
            settings: {
                titleFont: currentSettings.titleFont,
                descriptionFont: currentSettings.descriptionFont,
                iconYOffset: currentSettings.iconYOffset,
                titleYOffset: currentSettings.titleYOffset,
                descriptionYOffset: currentSettings.descriptionYOffset,
                iconXOffset: currentSettings.iconXOffset,
                iconSize: currentSettings.iconSize,
                titleLineHeight: currentSettings.titleLineHeight,
                descriptionLineHeight: currentSettings.descriptionLineHeight
            }
        };

        customPresets.push(newPreset);
        
        if (this.saveCustomPresets(customPresets)) {
            this.setCurrentPresetName(name);
            return { success: true };
        } else {
            return { success: false, error: 'Failed to save preset' };
        }
    }

    // Update existing preset with current settings
    updatePreset(name, currentSettings) {
        if (name === 'Default') {
            return { success: false, error: 'Cannot update Default preset' };
        }

        const customPresets = this.getCustomPresets();
        const presetIndex = customPresets.findIndex(preset => preset.name === name);
        
        if (presetIndex === -1) {
            return { success: false, error: 'Preset not found' };
        }

        customPresets[presetIndex].settings = {
            titleFont: currentSettings.titleFont,
            descriptionFont: currentSettings.descriptionFont,
            iconYOffset: currentSettings.iconYOffset,
            titleYOffset: currentSettings.titleYOffset,
            descriptionYOffset: currentSettings.descriptionYOffset,
            iconXOffset: currentSettings.iconXOffset,
            iconSize: currentSettings.iconSize,
            titleLineHeight: currentSettings.titleLineHeight,
            descriptionLineHeight: currentSettings.descriptionLineHeight
        };

        if (this.saveCustomPresets(customPresets)) {
            return { success: true };
        } else {
            return { success: false, error: 'Failed to update preset' };
        }
    }

    // Delete a custom preset
    deletePreset(name) {
        if (name === 'Default') {
            return { success: false, error: 'Cannot delete Default preset' };
        }

        const customPresets = this.getCustomPresets();
        const filteredPresets = customPresets.filter(preset => preset.name !== name);
        
        if (filteredPresets.length === customPresets.length) {
            return { success: false, error: 'Preset not found' };
        }

        if (this.saveCustomPresets(filteredPresets)) {
            // If we deleted the current preset, switch to Default
            if (this.getCurrentPresetName() === name) {
                this.setCurrentPresetName('Default');
            }
            return { success: true };
        } else {
            return { success: false, error: 'Failed to delete preset' };
        }
    }

    // Apply preset settings to the application
    applyPreset(presetName, settingsObject) {
        const preset = this.getPresetByName(presetName);
        if (!preset) {
            console.error('Preset not found:', presetName);
            return false;
        }

        // Apply all settings from preset
        Object.keys(preset.settings).forEach(key => {
            settingsObject[key] = preset.settings[key];
        });

        // Update UI elements
        this.updateUIFromSettings(preset.settings);
        
        // Set as current preset
        this.setCurrentPresetName(presetName);
        
        return true;
    }

    // Update UI elements to match preset settings
    updateUIFromSettings(settings) {
        // Update input fields
        const titleFontInput = document.getElementById('titleFontInput');
        if (titleFontInput) titleFontInput.value = settings.titleFont;

        const descriptionFontInput = document.getElementById('descriptionFontInput');
        if (descriptionFontInput) descriptionFontInput.value = settings.descriptionFont;

        // Update sliders and their outputs
        const sliderMappings = {
            iconYOffset: 'iconYOffset',
            titleYOffset: 'titleYOffset',
            descriptionYOffset: 'descriptionYOffset',
            iconXOffset: 'iconXOffset',
            iconSize: 'iconSize',
            titleLineHeight: 'titleLineHeight',
            descriptionLineHeight: 'descriptionLineHeight'
        };

        Object.keys(sliderMappings).forEach(settingKey => {
            const slider = document.getElementById(sliderMappings[settingKey]);
            if (slider) {
                slider.value = settings[settingKey];
                
                // Update corresponding output element
                const output = document.querySelector(`output[for="${sliderMappings[settingKey]}"]`);
                if (output) {
                    output.value = settings[settingKey];
                }
            }
        });
    }
}

// Create and export singleton instance
export const presetManager = new PresetManager();

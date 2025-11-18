const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Removido transformer SVG para compatibilidade total com Expo Web

module.exports = defaultConfig;

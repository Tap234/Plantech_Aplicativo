import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';

type Props = {
  style?: ViewStyle | ViewStyle[];
  size?: number;
  showLabel?: boolean;
  label?: string;
};

export default function Logo({ style, size = 96, showLabel = true, label = 'plantech' }: Props) {
  // main square that contains the leaf; label rendered below
  return (
    <View style={[{ alignItems: 'center' }, style]} accessible accessibilityLabel="Logo Plantech">
      <View style={[styles.container, { width: size, height: size }]}> 
        {/* base leaf (darker) */}
        <View style={[styles.leafBase, { width: size * 0.9, height: size * 0.9, borderRadius: (size * 0.9) / 2 }]} />
        {/* lighter overlay to create gradient-like feel */}
        <View style={[styles.leafOverlay, { width: size * 0.78, height: size * 0.78, borderRadius: (size * 0.78) / 2 }]} />
        {/* stem (white slim) */}
        <View style={[styles.stem, { height: size * 0.52 }]} />

        {/* circuit lines and nodes inside leaf */}
        <View style={styles.circuitContainer} pointerEvents="none">
          <View style={[styles.cLine, { left: '20%', top: '40%', width: '34%' }]} />
          <View style={[styles.cLine, { left: '38%', top: '30%', width: '30%' }]} />
          <View style={[styles.cLine, { left: '48%', top: '50%', width: '26%' }]} />

          <View style={[styles.node, { left: '20%', top: '40%' }]} />
          <View style={[styles.node, { left: '46%', top: '30%' }]} />
          <View style={[styles.node, { left: '74%', top: '46%' }]} />
          <View style={[styles.node, { left: '58%', top: '54%' }]} />
        </View>
      </View>

      {showLabel ? <Text style={styles.label}>{'PlanTech'}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  leafBase: {
    position: 'absolute',
    backgroundColor: '#2D6A4F',
    transform: [{ rotate: '-12deg' }],
    opacity: 1,
  },
  leafOverlay: {
    position: 'absolute',
    backgroundColor: '#39B980',
    transform: [{ rotate: '14deg' }],
    opacity: 1,
  },
  stem: {
    position: 'absolute',
    width: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    transform: [{ rotate: '-6deg' }],
    elevation: 2,
  },
  circuitContainer: {
    position: 'absolute',
    width: '80%',
    height: '80%',
  },
  cLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#5DE1D8',
    borderRadius: 2,
  },
  node: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#34E6E0',
    borderWidth: 2,
    borderColor: '#2D6A4F',
  },
  label: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '700',
    color: '#0F4F36',
  },
});

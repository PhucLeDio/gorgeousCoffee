import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "constants/theme";

// Biểu tượng: chiếc lá cà phê trên nền tròn, kèm một quả cà phê chín.
// `onDark`: nền tròn trắng, lá xanh, dùng trên nền xanh đậm cho khỏi chìm.
export function LogoMark({ size = 56, onDark = false }: { size?: number; onDark?: boolean }) {
  const bg = onDark ? "#fff" : colors.primary;
  const leaf = onDark ? colors.primary : "#fff";
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={32} fill={bg} />
      {/* Lá */}
      <Path d="M13 47 C11 27 27 12 48 12 C49 33 35 48 13 47 Z" fill={leaf} />
      <Path
        d="M15 45 C23 37 32 28 44 16"
        stroke={bg}
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M22.5 37.5 C21 34 21 31 21.5 28 M29.5 30.5 C29 27 29.5 23.5 30.5 21 M24.5 35.5 C28 36.5 31 36.5 34 35.5 M32 28 C35 29 38 28.5 41 27"
        stroke={bg}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      {/* Quả cà phê chín */}
      <Circle cx={46} cy={46} r={9.5} fill="#C62828" stroke={bg} strokeWidth={2.5} />
      <Path
        d="M46 39 C43.5 42.5 48.5 47.5 46 53"
        stroke="#7F1D1D"
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

// Logo đầy đủ: biểu tượng + chữ "Lá Cà Phê". `light` dùng trên nền xanh đậm.
export default function Logo({
  size = 48,
  light = false,
  tagline,
}: {
  size?: number;
  light?: boolean;
  tagline?: string;
}) {
  const fontSize = Math.round(size * 0.58);
  return (
    <View style={styles.row}>
      <LogoMark size={size} onDark={light} />
      <View>
        <Text style={[styles.word, { fontSize, lineHeight: fontSize * 1.15 }]}>
          <Text style={{ color: light ? "#fff" : colors.primaryDark }}>Lá </Text>
          <Text style={{ color: light ? "#FFE0B2" : colors.accent }}>Cà Phê</Text>
        </Text>
        {tagline && (
          <Text
            style={[
              styles.tagline,
              { color: light ? "rgba(255,255,255,0.9)" : colors.textMuted },
            ]}
          >
            {tagline}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  word: {
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 15,
    marginTop: 1,
  },
});

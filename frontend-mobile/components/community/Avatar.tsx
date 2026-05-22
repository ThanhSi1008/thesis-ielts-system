import React from 'react';
import { View, Text, Image } from 'react-native';
import { FONTS } from '@/constants';

export function Avatar({
  name,
  avatar,
  color,
  size = 38,
}: {
  name?: string;
  avatar?: string | null;
  color?: string;
  size?: number;
}) {
  if (avatar) {
    return (
      <Image
        source={{ uri: avatar }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  const bg = color ?? '#4CAF50';
  const initial = name ? name[0].toUpperCase() : '?';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg + '22',
        borderColor: bg + '44',
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: FONTS.bold, fontSize: size * 0.38, color: bg }}>{initial}</Text>
    </View>
  );
}

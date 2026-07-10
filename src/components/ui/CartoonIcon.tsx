import React from 'react';
import { Image } from 'react-native';
import type { StyleProp, ImageStyle } from 'react-native';

// Custom glossy 3D sticker icons (Canva-generated, brand-styled) — the
// "better emoji" set. Use these on playful surfaces instead of flat glyphs.
const ICONS = {
  bed: require('../../../assets/cartoon/bed.png'),
  plate: require('../../../assets/cartoon/plate.png'),
  bath: require('../../../assets/cartoon/bath.png'),
  tree: require('../../../assets/cartoon/tree.png'),
  puppy: require('../../../assets/cartoon/puppy.png'),
  laundry: require('../../../assets/cartoon/laundry.png'),
  books: require('../../../assets/cartoon/books.png'),
  gift: require('../../../assets/cartoon/gift.png'),
  flame: require('../../../assets/cartoon/flame.png'),
  star: require('../../../assets/cartoon/star.png'),
  happy: require('../../../assets/cartoon/avatars/happy.png'),
  trophy: require('../../../assets/cartoon/avatars/trophy.png'),
} as const;

export type CartoonIconName = keyof typeof ICONS;

// Chore category -> sticker. Every ChoreCategory value maps here.
export const CATEGORY_CARTOON: Record<string, CartoonIconName> = {
  bedroom: 'bed',
  kitchen: 'plate',
  bathroom: 'bath',
  outdoor: 'tree',
  pets: 'puppy',
  laundry: 'laundry',
  homework: 'books',
  other: 'star',
};

interface CartoonIconProps {
  name: CartoonIconName;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function CartoonIcon({ name, size = 28, style }: CartoonIconProps) {
  return (
    <Image
      source={ICONS[name]}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

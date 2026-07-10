import type { ImageSourcePropType } from 'react-native';

// Glossy 3D sticker art for every avatar icon choice (Canva-generated,
// matching the assets/cartoon/ chore-category set). Keyed by the SAME names
// ProfileEditModal has always stored in `avatar_icon`, so existing rows
// upgrade to cartoons automatically — no migration. `star`/`paw`/`book`
// reuse the original category stickers.
export const AVATAR_CARTOON: Record<string, ImageSourcePropType> = {
  happy: require('../../../assets/cartoon/avatars/happy.png'),
  star: require('../../../assets/cartoon/star.png'),
  trophy: require('../../../assets/cartoon/avatars/trophy.png'),
  medal: require('../../../assets/cartoon/avatars/medal.png'),
  paw: require('../../../assets/cartoon/puppy.png'),
  football: require('../../../assets/cartoon/avatars/football.png'),
  basketball: require('../../../assets/cartoon/avatars/basketball.png'),
  bicycle: require('../../../assets/cartoon/avatars/bicycle.png'),
  'game-controller': require('../../../assets/cartoon/avatars/game-controller.png'),
  rocket: require('../../../assets/cartoon/avatars/rocket.png'),
  airplane: require('../../../assets/cartoon/avatars/airplane.png'),
  boat: require('../../../assets/cartoon/avatars/boat.png'),
  'car-sport': require('../../../assets/cartoon/avatars/car-sport.png'),
  heart: require('../../../assets/cartoon/avatars/heart.png'),
  planet: require('../../../assets/cartoon/avatars/planet.png'),
  sunny: require('../../../assets/cartoon/avatars/sunny.png'),
  moon: require('../../../assets/cartoon/avatars/moon.png'),
  cloud: require('../../../assets/cartoon/avatars/cloud.png'),
  'ice-cream': require('../../../assets/cartoon/avatars/ice-cream.png'),
  pizza: require('../../../assets/cartoon/avatars/pizza.png'),
  'musical-notes': require('../../../assets/cartoon/avatars/musical-notes.png'),
  brush: require('../../../assets/cartoon/avatars/brush.png'),
  book: require('../../../assets/cartoon/books.png'),
  flower: require('../../../assets/cartoon/avatars/flower.png'),
  leaf: require('../../../assets/cartoon/avatars/leaf.png'),
  fish: require('../../../assets/cartoon/avatars/fish.png'),
};

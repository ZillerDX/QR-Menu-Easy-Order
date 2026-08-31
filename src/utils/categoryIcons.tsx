import React from 'react';
import {
  Coffee,
  CupSoda,
  GlassWater,
  Beer,
  Wine,
  Martini,
  Utensils,
  Beef,
  Drumstick,
  Fish,
  Soup,
  Salad,
  Pizza,
  Sandwich,
  Croissant,
  Cake,
  Donut,
  IceCream,
  Dessert,
  Cookie,
  Popcorn,
  Apple,
  Citrus,
  Cherry,
  Egg,
  Sparkles,
  Flame,
  Heart,
  Tag,
  type LucideIcon,
} from 'lucide-react';

export type CategoryIconGroup = 'all' | 'food' | 'drink' | 'dessert' | 'special';

export interface CategoryIconDefinition {
  id: string;
  name: string;
  icon: LucideIcon;
  labelTh: string;
  labelEn: string;
  group: 'food' | 'drink' | 'dessert' | 'special';
  color: string;
  bgLight: string;
  borderLight: string;
}

export const CATEGORY_ICONS_LIST: CategoryIconDefinition[] = [
  // Specials & Recommendations
  { id: 'Sparkles', name: 'Sparkles', icon: Sparkles, labelTh: 'แนะนำ / ยอดฮิต', labelEn: "Chef's Specials", group: 'special', color: 'text-amber-500', bgLight: 'bg-amber-50', borderLight: 'border-amber-200/80' },
  { id: 'Flame', name: 'Flame', icon: Flame, labelTh: 'รสจัด / ซิกเนเจอร์', labelEn: 'Hot & Signature', group: 'special', color: 'text-red-500', bgLight: 'bg-red-50', borderLight: 'border-red-200/80' },
  { id: 'Heart', name: 'Heart', icon: Heart, labelTh: 'เพื่อสุขภาพ / คลีน', labelEn: 'Healthy & Vegan', group: 'special', color: 'text-rose-500', bgLight: 'bg-rose-50', borderLight: 'border-rose-200/80' },
  { id: 'Tag', name: 'Tag', icon: Tag, labelTh: 'โปรโมชั่น / ทั่วไป', labelEn: 'Promotions', group: 'special', color: 'text-stone-600', bgLight: 'bg-stone-100', borderLight: 'border-stone-200/80' },

  // Drinks & Beverages
  { id: 'Coffee', name: 'Coffee', icon: Coffee, labelTh: 'กาแฟ', labelEn: 'Coffee', group: 'drink', color: 'text-amber-700', bgLight: 'bg-amber-50', borderLight: 'border-amber-200/80' },
  { id: 'CupSoda', name: 'CupSoda', icon: CupSoda, labelTh: 'ชา / น้ำหวาน', labelEn: 'Tea & Soda', group: 'drink', color: 'text-emerald-600', bgLight: 'bg-emerald-50', borderLight: 'border-emerald-200/80' },
  { id: 'GlassWater', name: 'GlassWater', icon: GlassWater, labelTh: 'น้ำดื่ม / มินเนอรัล', labelEn: 'Water', group: 'drink', color: 'text-sky-600', bgLight: 'bg-sky-50', borderLight: 'border-sky-200/80' },
  { id: 'Citrus', name: 'Citrus', icon: Citrus, labelTh: 'น้ำผลไม้ / ส้ม', labelEn: 'Citrus & Juices', group: 'drink', color: 'text-orange-500', bgLight: 'bg-orange-50', borderLight: 'border-orange-200/80' },
  { id: 'Beer', name: 'Beer', icon: Beer, labelTh: 'เบียร์ / คราฟต์', labelEn: 'Beer', group: 'drink', color: 'text-yellow-600', bgLight: 'bg-yellow-50', borderLight: 'border-yellow-200/80' },
  { id: 'Wine', name: 'Wine', icon: Wine, labelTh: 'ไวน์', labelEn: 'Wine', group: 'drink', color: 'text-rose-700', bgLight: 'bg-rose-50', borderLight: 'border-rose-200/80' },
  { id: 'Martini', name: 'Martini', icon: Martini, labelTh: 'ค็อกเทล / บาร์', labelEn: 'Cocktails', group: 'drink', color: 'text-purple-600', bgLight: 'bg-purple-50', borderLight: 'border-purple-200/80' },

  // Food & Main Dishes
  { id: 'Utensils', name: 'Utensils', icon: Utensils, labelTh: 'อาหารจานหลัก', labelEn: 'Main Dishes', group: 'food', color: 'text-orange-600', bgLight: 'bg-orange-50', borderLight: 'border-orange-200/80' },
  { id: 'Beef', name: 'Beef', icon: Beef, labelTh: 'สเต๊ก & เนื้อ', labelEn: 'Steak & Meat', group: 'food', color: 'text-red-700', bgLight: 'bg-red-50', borderLight: 'border-red-200/80' },
  { id: 'Drumstick', name: 'Drumstick', icon: Drumstick, labelTh: 'ไก่ทอด / เมนูไก่', labelEn: 'Chicken & Poultry', group: 'food', color: 'text-amber-600', bgLight: 'bg-amber-50', borderLight: 'border-amber-200/80' },
  { id: 'Fish', name: 'Fish', icon: Fish, labelTh: 'ซีฟู้ด & ปลา', labelEn: 'Seafood & Fish', group: 'food', color: 'text-cyan-600', bgLight: 'bg-cyan-50', borderLight: 'border-cyan-200/80' },
  { id: 'Soup', name: 'Soup', icon: Soup, labelTh: 'ซุป & ก๋วยเตี๋ยว', labelEn: 'Soup & Noodles', group: 'food', color: 'text-orange-500', bgLight: 'bg-orange-50', borderLight: 'border-orange-200/80' },
  { id: 'Salad', name: 'Salad', icon: Salad, labelTh: 'สลัด & ผักสด', labelEn: 'Salad & Greens', group: 'food', color: 'text-lime-600', bgLight: 'bg-lime-50', borderLight: 'border-lime-200/80' },
  { id: 'Pizza', name: 'Pizza', icon: Pizza, labelTh: 'พิซซ่า & ฟาสต์ฟู้ด', labelEn: 'Pizza & Fast Food', group: 'food', color: 'text-red-600', bgLight: 'bg-red-50', borderLight: 'border-red-200/80' },
  { id: 'Sandwich', name: 'Sandwich', icon: Sandwich, labelTh: 'แซนด์วิช & เบอร์เกอร์', labelEn: 'Sandwich & Burger', group: 'food', color: 'text-amber-600', bgLight: 'bg-amber-50', borderLight: 'border-amber-200/80' },
  { id: 'Egg', name: 'Egg', icon: Egg, labelTh: 'อาหารเช้า & ไข่', labelEn: 'Breakfast & Eggs', group: 'food', color: 'text-yellow-600', bgLight: 'bg-yellow-50', borderLight: 'border-yellow-200/80' },

  // Bakery, Desserts & Snacks
  { id: 'Croissant', name: 'Croissant', icon: Croissant, labelTh: 'ครัวซองต์ & ขนมปัง', labelEn: 'Croissant & Bread', group: 'dessert', color: 'text-amber-700', bgLight: 'bg-amber-50', borderLight: 'border-amber-200/80' },
  { id: 'Cake', name: 'Cake', icon: Cake, labelTh: 'เค้ก & เบเกอรี่', labelEn: 'Cakes & Bakery', group: 'dessert', color: 'text-pink-600', bgLight: 'bg-pink-50', borderLight: 'border-pink-200/80' },
  { id: 'Donut', name: 'Donut', icon: Donut, labelTh: 'โดนัท', labelEn: 'Donuts', group: 'dessert', color: 'text-pink-500', bgLight: 'bg-pink-50', borderLight: 'border-pink-200/80' },
  { id: 'IceCream', name: 'IceCream', icon: IceCream, labelTh: 'ไอศกรีม / บิงซู', labelEn: 'Ice Cream', group: 'dessert', color: 'text-teal-600', bgLight: 'bg-teal-50', borderLight: 'border-teal-200/80' },
  { id: 'Dessert', name: 'Dessert', icon: Dessert, labelTh: 'ของหวาน / พุดดิ้ง', labelEn: 'Desserts', group: 'dessert', color: 'text-fuchsia-600', bgLight: 'bg-fuchsia-50', borderLight: 'border-fuchsia-200/80' },
  { id: 'Cookie', name: 'Cookie', icon: Cookie, labelTh: 'คุกกี้ / บิสกิต', labelEn: 'Cookies', group: 'dessert', color: 'text-amber-800', bgLight: 'bg-amber-50', borderLight: 'border-amber-200/80' },
  { id: 'Popcorn', name: 'Popcorn', icon: Popcorn, labelTh: 'ของทานเล่น & สแน็ก', labelEn: 'Snacks & Popcorn', group: 'dessert', color: 'text-yellow-600', bgLight: 'bg-yellow-50', borderLight: 'border-yellow-200/80' },
  { id: 'Apple', name: 'Apple', icon: Apple, labelTh: 'ผลไม้สด', labelEn: 'Fresh Fruits', group: 'dessert', color: 'text-rose-600', bgLight: 'bg-rose-50', borderLight: 'border-rose-200/80' },
  { id: 'Cherry', name: 'Cherry', icon: Cherry, labelTh: 'ผลไม้ / เบอร์รี่', labelEn: 'Berries & Fruits', group: 'dessert', color: 'text-red-500', bgLight: 'bg-red-50', borderLight: 'border-red-200/80' },
];

const ICONS_MAP = new Map<string, CategoryIconDefinition>(
  CATEGORY_ICONS_LIST.map((item) => [item.id.toLowerCase(), item])
);

export const getCategoryIconDefinition = (iconName?: string): CategoryIconDefinition => {
  if (!iconName) return CATEGORY_ICONS_LIST[0];
  const found = ICONS_MAP.get(iconName.trim().toLowerCase());
  return found || CATEGORY_ICONS_LIST[0];
};

export const renderCategoryIcon = (
  iconName?: string,
  className = 'w-4 h-4 flex-shrink-0',
  customColor?: string
): React.ReactElement => {
  const def = getCategoryIconDefinition(iconName);
  const IconComp = def.icon;
  const colorClass = customColor !== undefined ? customColor : def.color;
  return <IconComp className={`${className} ${colorClass}`} />;
};

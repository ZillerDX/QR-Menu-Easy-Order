import { MenuCategory, MenuItem, StoreConfig } from '../types';

export const initialStoreConfig: StoreConfig = {
  name: "Bistro & Craft Cafe",
  tagline: "อาหารและเครื่องดื่มคราฟต์ สแกนสั่งง่ายไม่ต้องรอคิว",
  promptpayNumber: "0812345678",
  promptpayName: "บิสโทร แอนด์ คราฟต์ คาเฟ่",
  openTime: "08:30 - 21:00 น.",
  tableCount: 15,
};

export const initialCategories: MenuCategory[] = [
  { id: "popular", name: "เมนูแนะนำ 🔥", icon: "Sparkles" },
  { id: "coffee", name: "กาแฟ (Coffee)", icon: "Coffee" },
  { id: "non-coffee", name: "ชา & เครื่องดื่ม", icon: "CupSoda" },
  { id: "food", name: "อาหารจานหลัก", icon: "Utensils" },
  { id: "bakery", name: "เบเกอรี่ & ของหวาน", icon: "Cake" },
  { id: "snacks", name: "ของทานเล่น", icon: "Pizza" },
];

const sweetnessGroup = {
  id: "sweetness",
  name: "ระดับความหวาน (Sweetness)",
  required: true,
  maxSelect: 1,
  choices: [
    { id: "s-100", name: "หวานปกติ (100%)", priceDelta: 0, isDefault: true },
    { id: "s-50", name: "หวานน้อย (50%)", priceDelta: 0 },
    { id: "s-25", name: "หวาน 25%", priceDelta: 0 },
    { id: "s-0", name: "ไม่หวานเลย (0%)", priceDelta: 0 },
  ],
};

const milkGroup = {
  id: "milk",
  name: "ประเภทนม (Milk Choice)",
  required: false,
  maxSelect: 1,
  choices: [
    { id: "m-regular", name: "นมสดปกติ (Fresh Milk)", priceDelta: 0, isDefault: true },
    { id: "m-oat", name: "นมข้าวโอ๊ต (Oat Milk)", priceDelta: 20 },
    { id: "m-soy", name: "นมถั่วเหลือง (Soy Milk)", priceDelta: 15 },
    { id: "m-almond", name: "นมอัลมอนด์ (Almond Milk)", priceDelta: 25 },
  ],
};

const coffeeAddons = {
  id: "addons",
  name: "ท็อปปิ้งเพิ่มเติม (Add-ons)",
  required: false,
  maxSelect: 3,
  choices: [
    { id: "to-shot", name: "เพิ่ม Espresso Shot (+1 Shot)", priceDelta: 20 },
    { id: "to-caramel", name: "ราดซอสคาราเมล", priceDelta: 15 },
    { id: "to-whip", name: "วิปปิ้งครีมสด", priceDelta: 20 },
    { id: "to-boba", name: "ไข่มุกบราวน์ชูการ์", priceDelta: 15 },
  ],
};

export const initialMenuItems: MenuItem[] = [
  {
    id: "c-1",
    categoryId: "coffee",
    name: "Iced Dirty Coffee (เดอร์ตี้คอฟฟี่)",
    nameEn: "Signature Dirty Coffee",
    description: "นมสดแช่เย็นจัดสูตรพิเศษ ราดด้วยเอสเพรสโซ่ช็อตเข้มข้นสกัดร้อน รสสัมผัสกลมกล่อม",
    price: 95,
    imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: true,
    isChefRecommend: true,
    optionGroups: [sweetnessGroup, milkGroup, coffeeAddons],
  },
  {
    id: "c-2",
    categoryId: "coffee",
    name: "Iced Americano (อเมริกาโน่เย็น)",
    nameEn: "Iced Americano",
    description: "เมล็ดกาแฟ House Blend คั่วกลาง โทนช็อกโกแลตและผลไม้ หอมสดชื่น ดื่มง่าย",
    price: 75,
    imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: true,
    optionGroups: [sweetnessGroup, coffeeAddons],
  },
  {
    id: "c-3",
    categoryId: "coffee",
    name: "Salted Caramel Latte (ลาเต้ซอลท์เท็ดคาราเมล)",
    nameEn: "Iced Salted Caramel Latte",
    description: "ลาเต้นมสดนุ่มละมุน ผสานไซรัปคาราเมลเคี่ยวและเกลือชมพูหิมาลายัน",
    price: 105,
    imageUrl: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    optionGroups: [sweetnessGroup, milkGroup, coffeeAddons],
  },
  {
    id: "nc-1",
    categoryId: "non-coffee",
    name: "Ceremonial Uji Matcha Latte (มัทฉะลาเต้แท้จากอุจิ)",
    nameEn: "Premium Uji Matcha Latte",
    description: "ผงมัทฉะเกรดพิธีการชงสด เข้มข้น หอมกลิ่นสาหร่าย ไม่ขมฝาด ผสมนมสดแท้",
    price: 110,
    imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: true,
    isChefRecommend: true,
    optionGroups: [sweetnessGroup, milkGroup, coffeeAddons],
  },
  {
    id: "nc-2",
    categoryId: "non-coffee",
    name: "Thai Milk Tea (ชาไทยโบราณคราฟต์)",
    nameEn: "Signature Craft Thai Tea",
    description: "ชาไทยใบชา 3 แหล่งเบลนด์พิเศษ หอมเข้ม กลมกล่อมนมสด ไม่หวานเลี่ยน",
    price: 75,
    imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    optionGroups: [sweetnessGroup, coffeeAddons],
  },
  {
    id: "nc-3",
    categoryId: "non-coffee",
    name: "Yuzu Sparkling Americano / Soda (ยูซุสปาร์คกลิ้ง)",
    nameEn: "Honey Yuzu Sparkling",
    description: "น้ำส้มยูซุแท้นำเข้าจากญี่ปุ่น ผสมน้ำผึ้งป่าและโซดา ซ่าสดชื่นคลายร้อน",
    price: 90,
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    optionGroups: [sweetnessGroup],
  },
  {
    id: "f-1",
    categoryId: "food",
    name: "Spaghetti Carbonara (สปาเก็ตตี้คาโบนาร่าสูตรดั้งเดิม)",
    nameEn: "Classic Guanciale Carbonara",
    description: "เส้นสปาเก็ตตี้เหนียวนุ่ม ผัดซอสไข่แดง พาร์เมซานชีสแท้ และเบคอนกรอบ ไม่อมน้ำมัน",
    price: 185,
    imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: true,
    isChefRecommend: true,
    optionGroups: [
      {
        id: "spicy-level",
        name: "ระดับความเผ็ด (Spiciness)",
        required: true,
        choices: [
          { id: "sp-no", name: "ไม่เผ็ด (พริกไทยดำเล็กน้อย)", priceDelta: 0, isDefault: true },
          { id: "sp-medium", name: "เผ็ดพริกแห้งปานกลาง", priceDelta: 0 },
        ],
      },
      {
        id: "extra-topping",
        name: "เพิ่มเครื่องพิเศษ",
        required: false,
        choices: [
          { id: "ex-cheese", name: "เพิ่มชีสพาร์เมซานขูด", priceDelta: 30 },
          { id: "ex-bacon", name: "เพิ่มเบคอนกรอบ 2 เท่า", priceDelta: 35 },
          { id: "ex-egg", name: "เพิ่มไข่ออนเซ็น", priceDelta: 20 },
        ],
      }
    ],
  },
  {
    id: "f-2",
    categoryId: "food",
    name: "ข้าวผัดกะเพราเนื้อวากิวสับไข่ดาวกรอบ",
    nameEn: "Wagyu Holy Basil with Fried Egg",
    description: "เนื้อวากิวสับผัดใบกะเพราป่ารสจัดจ้าน เสิร์ฟพร้อมข้าวหอมมะลิและไข่ดาวเป็ดขอบกรอบ",
    price: 165,
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: true,
    optionGroups: [
      {
        id: "spicy-kaprao",
        name: "ระดับความเผ็ด",
        required: true,
        choices: [
          { id: "kp-mild", name: "เผ็ดน้อย", priceDelta: 0 },
          { id: "kp-med", name: "เผ็ดกลาง (สูตรปกติ)", priceDelta: 0, isDefault: true },
          { id: "kp-hot", name: "เผ็ดมาก (พริกขี้หนูสวน)", priceDelta: 0 },
        ],
      },
      {
        id: "egg-choice",
        name: "เลือกไข่",
        required: true,
        choices: [
          { id: "egg-fried", name: "ไข่ดาวเป็ดกรอบ", priceDelta: 0, isDefault: true },
          { id: "egg-soft", name: "ไข่ดาวไม่สุกเยิ้มๆ", priceDelta: 0 },
          { id: "egg-omlet", name: "เปลี่ยนเป็นไข่ข้น", priceDelta: 15 },
        ],
      }
    ],
  },
  {
    id: "b-1",
    categoryId: "bakery",
    name: "Croissant French Butter (ครัวซองต์เนยฝรั่งเศส)",
    nameEn: "AOP Butter Croissant",
    description: "แป้งกรอบนอก ฉ่ำเนยฝรั่งเศส AOP แท้ หอมฟุ้ง กรอบฟู ละลายในปาก",
    price: 85,
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    optionGroups: [
      {
        id: "warm-choice",
        name: "การอุ่น",
        required: true,
        choices: [
          { id: "w-hot", name: "อบร้อนพร้อมทาน", priceDelta: 0, isDefault: true },
          { id: "w-normal", name: "ไม่อบ (รับอุณหภูมิห้อง)", priceDelta: 0 },
        ],
      }
    ],
  },
  {
    id: "b-2",
    categoryId: "bakery",
    name: "Basque Burnt Cheesecake (ชีสเค้กหน้าไหม้)",
    nameEn: "Basque Burnt Cheesecake",
    description: "ชีสเค้กเนื้อเนียนนุ่ม หอมกลิ่นคาราเมลไหม้เฉพาะตัว รสชาติเปรี้ยวอมหวานเข้มข้น",
    price: 120,
    imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
  },
  {
    id: "s-1",
    categoryId: "snacks",
    name: "Truffle French Fries (เฟรนช์ฟรายส์ซอสทรัฟเฟิล)",
    nameEn: "Truffle Fries with Dip",
    description: "มันฝรั่งทอดแท่งหนากรอบ คลุกเคล้าน้ำมันทรัฟเฟิลแท้ โรยพาร์เมซาน เสิร์ฟคู่ดิปทรัฟเฟิลมาโย",
    price: 135,
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
  }
];

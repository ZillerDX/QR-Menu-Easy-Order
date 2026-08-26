export interface OptionChoice {
  id: string;
  name: string;
  priceDelta: number; // e.g. 0, 15, 20
  isDefault?: boolean;
}

export interface OptionGroup {
  id: string;
  name: string; // e.g. "ระดับความหวาน", "ประเภทนม", "ท็อปปิ้ง"
  required: boolean;
  minSelect?: number;
  maxSelect?: number; // 1 for radio, >1 for checkboxes
  choices: OptionChoice[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  nameEn?: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isPopular?: boolean;
  isChefRecommend?: boolean;
  optionGroups?: OptionGroup[];
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
}

export interface SelectedOption {
  groupId: string;
  groupName: string;
  choiceId: string;
  choiceName: string;
  priceDelta: number;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: SelectedOption[];
  specialNote: string;
  unitPriceWithDelta: number;
  totalItemPrice: number;
}

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'promptpay' | 'cash';
export type PaymentStatus = 'unpaid' | 'paid';

export interface Order {
  id: string;
  orderNumber: string; // e.g. #0042
  tableNumber: string;
  items: CartItem[];
  subtotal: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string; // ISO string
  customerNote?: string;
}

export interface StoreConfig {
  name: string;
  tagline: string;
  promptpayNumber: string;
  promptpayName: string;
  openTime: string;
  tableCount: number;
}

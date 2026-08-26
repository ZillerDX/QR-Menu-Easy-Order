export type Language = 'th' | 'en';

export interface OptionChoice {
  id: string;
  name: string;
  nameEn?: string;
  priceDelta: number;
  isDefault?: boolean;
}

export interface OptionGroup {
  id: string;
  name: string;
  nameEn?: string;
  required: boolean;
  minSelect?: number;
  maxSelect?: number;
  choices: OptionChoice[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isPopular?: boolean;
  isChefRecommend?: boolean;
  tags?: string[];
  optionGroups?: OptionGroup[];
}

export interface MenuCategory {
  id: string;
  name: string;
  nameEn: string;
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
  orderNumber: string;
  tableNumber: string;
  items: CartItem[];
  subtotal: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  customerNote?: string;
}

export interface StoreConfig {
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  promptpayNumber: string;
  promptpayName: string;
  openTime: string;
  tableCount: number;
}

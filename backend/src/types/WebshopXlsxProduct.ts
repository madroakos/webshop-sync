export interface WebshopXlsxProduct {
  articleNumber: string;
  product_id: string;
  producer: string;
  category: string;
  unit: string;
  name: string;
  short_description: string;
  weight_full: number;
  weight_net: number;
  barcode: string;
  sef_url: string;
  image_link: string;
  product_available: number;
  explicit: number;
  price_net?: number;
  price_br?: number;
  quantity?: number;
}

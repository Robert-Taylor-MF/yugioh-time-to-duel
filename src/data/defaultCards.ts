export interface Card {
  id: string;
  name: string;
  type: 'Monster' | 'Spell' | 'Trap' | 'Extra';
  originalType: string;
  subType: string;
  rarity: string;
  edition: string;
  collection: string;
  description: string;
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  imageUrl: string;
  imageUrlSmall: string;
  sets: {
    set_name: string;
    set_code: string;
    set_rarity: string;
    set_price: string;
  }[];
  prices: {
    cardmarket_price: string;
    tcgplayer_price: string;
    ebay_price: string;
    amazon_price: string;
    coolstuffinc_price: string;
  };
}

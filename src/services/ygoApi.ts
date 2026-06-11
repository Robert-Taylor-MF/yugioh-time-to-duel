import { saveCardsToDb } from './cardDb';
import { type Card } from '../data/defaultCards';

const API_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

export interface ApiCard {
  id: number;
  name: string;
  type: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  rank?: number;
  linkval?: number;
  race?: string;
  attribute?: string;
  card_images?: { image_url: string; image_url_small: string }[];
  card_sets?: { set_name: string; set_code: string; set_rarity: string; set_price: string }[];
  card_prices?: { cardmarket_price: string; tcgplayer_price: string; ebay_price: string; amazon_price: string; coolstuffinc_price: string }[];
}

const getAppCardType = (apiType: string): 'Monster' | 'Spell' | 'Trap' | 'Extra' => {
  const t = apiType.toLowerCase();
  if (t.includes('spell')) return 'Spell';
  if (t.includes('trap')) return 'Trap';
  if (
    t.includes('fusion') ||
    t.includes('synchro') ||
    t.includes('xyz') ||
    t.includes('link')
  ) {
    return 'Extra';
  }
  return 'Monster';
};

export const fetchAndCacheCards = async (): Promise<Card[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Falha ao carregar dados da API: ${response.statusText}`);
    }
    const json = await response.json();
    const apiCards: ApiCard[] = json.data || [];

    const mappedCards: Card[] = apiCards.map(c => {
      const type = getAppCardType(c.type);
      return {
        id: String(c.id),
        name: c.name,
        type,
        originalType: c.type,
        subType: c.race || '',
        rarity: c.card_sets?.[0]?.set_rarity || 'Common',
        edition: 'Unlimited',
        collection: c.card_sets?.[0]?.set_name || 'Promo',
        description: c.desc || '',
        atk: c.atk,
        def: c.def,
        level: c.level || c.rank || c.linkval || 0,
        attribute: c.attribute || '',
        imageUrl: c.card_images?.[0]?.image_url || '',
        imageUrlSmall: c.card_images?.[0]?.image_url_small || '',
        sets: (c.card_sets || []).map(s => ({
          set_name: s.set_name,
          set_code: s.set_code,
          set_rarity: s.set_rarity,
          set_price: s.set_price
        })),
        prices: c.card_prices?.[0] || {
          cardmarket_price: '0.00',
          tcgplayer_price: '0.00',
          ebay_price: '0.00',
          amazon_price: '0.00',
          coolstuffinc_price: '0.00'
        }
      };
    });

    await saveCardsToDb(mappedCards);
    localStorage.setItem('yugioh_cards_last_update', new Date().toISOString());
    return mappedCards;
  } catch (error) {
    console.error('Error in fetchAndCacheCards:', error);
    throw error;
  }
};

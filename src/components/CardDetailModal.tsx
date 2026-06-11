import React from 'react';
import { type Card } from '../data/defaultCards';
import { X, Tag, DollarSign } from 'lucide-react';

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose }) => {
  if (!card) return null;

  return (
    <div className="standard-modal-overlay no-print" style={{ zIndex: 1000 }} onClick={onClose}>
      <div 
        className="standard-modal" 
        style={{ 
          maxWidth: '480px', 
          width: '90%', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '800', margin: 0 }}>
              {card.name}
            </h3>
            <span style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: '600' }}>
              {card.originalType} • {card.subType}
            </span>
          </div>
          <button 
            className="qty-btn" 
            onClick={onClose} 
            style={{ padding: '6px', color: 'rgba(255,255,255,0.5)' }}
            aria-label="Fechar Detalhes"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card Image Wrapper */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            background: 'rgba(0,0,0,0.3)', 
            padding: '12px', 
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {card.imageUrl ? (
              <img 
                src={card.imageUrl} 
                alt={card.name} 
                style={{ 
                  maxHeight: '260px', 
                  borderRadius: '6px', 
                  boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
                }} 
              />
            ) : (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
                Sem Imagem Disponível
              </div>
            )}
          </div>

          {/* Stats Bar if Monster */}
          {(card.type === 'Monster' || card.type === 'Extra') && card.atk !== undefined && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              background: 'rgba(255,255,255,0.02)', 
              padding: '8px', 
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.05)',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              <div>Atributo: <span style={{ color: '#ffb300' }}>{card.attribute || 'N/A'}</span></div>
              <div>Nível/Rank: <span style={{ color: 'var(--gold)' }}>{card.level}</span></div>
              <div>ATK: <span style={{ color: '#fff' }}>{card.atk}</span></div>
              <div>DEF: <span style={{ color: '#fff' }}>{card.def}</span></div>
            </div>
          )}

          {/* Card Text Description */}
          <div style={{ 
            background: 'rgba(0,0,0,0.2)', 
            padding: '12px', 
            borderRadius: '6px',
            borderLeft: '3px solid var(--gold)',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            <h4 style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0' }}>
              Efeito / Descrição
            </h4>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>
              {card.description}
            </p>
          </div>

          {/* Sets & Collections */}
          {card.sets && card.sets.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={12} /> Coleções e Raridades ({card.sets.length})
              </h4>
              <div style={{ 
                maxHeight: '100px', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '4px',
                background: 'rgba(0,0,0,0.1)',
                padding: '6px',
                borderRadius: '6px'
              }}>
                {card.sets.map((set, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '3px' }}>
                    <span style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                      {set.set_name} ({set.set_code})
                    </span>
                    <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{set.set_rarity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Prices */}
          {card.prices && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <DollarSign size={12} /> Cotações de Mercado (USD)
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '8px', 
                fontSize: '10px',
                background: 'rgba(0,0,0,0.1)',
                padding: '8px',
                borderRadius: '6px'
              }}>
                <div>Cardmarket: <strong style={{ color: '#fff' }}>${card.prices.cardmarket_price}</strong></div>
                <div>TCGPlayer: <strong style={{ color: '#fff' }}>${card.prices.tcgplayer_price}</strong></div>
                <div>eBay: <strong style={{ color: '#fff' }}>${card.prices.ebay_price}</strong></div>
                <div>Amazon: <strong style={{ color: '#fff' }}>${card.prices.amazon_price}</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

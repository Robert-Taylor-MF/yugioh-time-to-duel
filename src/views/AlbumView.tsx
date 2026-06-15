import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CardDetailModal } from '../components/CardDetailModal';
import { 
  Plus, 
  Minus, 
  Search, 
  Printer, 
  Download, 
  Star, 
  FolderPlus, 
  Folder, 
  Trash2, 
  FolderOpen, 
  ArrowLeft,
  BookOpenCheck
} from 'lucide-react';
import { type Card } from '../data/defaultCards';

export const AlbumView: React.FC = () => {
  const {
    allCards,
    collection,
    addToCollection,
    removeFromCollection,
    favorites,
    toggleFavorite,
    isFavorite,
    customAlbums,
    createCustomAlbum,
    deleteCustomAlbum,
    addCardToCustomAlbum,
    removeCardFromCustomAlbum
  } = useApp();

  // --- General States ---
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'my-albums'>('catalog');
  const [selectedCardDetail, setSelectedCardDetail] = useState<Card | null>(null);

  // --- Catalog States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'All' | 'Monster' | 'Spell' | 'Trap' | 'Extra'>('All');
  const [activeRarityFilter, setActiveRarityFilter] = useState<string>('All');
  const [visualFilter, setVisualFilter] = useState<'All' | 'Owned' | 'Wanted' | 'Favorites'>('All');
  
  // Custom album selector popup state
  const [addingCardToAlbum, setAddingCardToAlbum] = useState<Card | null>(null);

  // --- My Albums States ---
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  
  // Album inner search to add cards
  const [albumCardSearch, setAlbumCardSearch] = useState('');

  // --- Helpers ---
  const getCardQuantity = (cardId: string): number => {
    const found = collection.find(item => item.cardId === cardId);
    return found ? found.quantity : 0;
  };

  const getCardWantedQuantity = (cardId: string): number => {
    const found = collection.find(item => item.cardId === cardId);
    return found ? (found.wanted || 0) : 0;
  };

  // --- Filtering Catalog ---
  const filteredCards = allCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          card.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          card.subType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = activeTypeFilter === 'All' ? true : card.type === activeTypeFilter;
    const matchesRarity = activeRarityFilter === 'All' 
      ? true 
      : card.rarity.toLowerCase().includes(activeRarityFilter.toLowerCase());

    const qty = getCardQuantity(card.id);
    const wantedQty = getCardWantedQuantity(card.id);
    const isFav = isFavorite(card.id);

    if (visualFilter === 'Owned' && qty === 0) return false;
    if (visualFilter === 'Wanted' && wantedQty === 0) return false;
    if (visualFilter === 'Favorites' && !isFav) return false;

    return matchesSearch && matchesType && matchesRarity;
  });

  const visibleCards = filteredCards.slice(0, 50);

  // --- Album Actions ---
  const handleCreateAlbum = () => {
    if (!newAlbumName.trim()) return;
    createCustomAlbum(newAlbumName.trim(), newAlbumDesc.trim());
    setNewAlbumName('');
    setNewAlbumDesc('');
    setShowCreateAlbumModal(false);
  };

  const currentAlbum = customAlbums.find(a => a.id === selectedAlbumId);

  // Filter cards to add within an album
  const albumSearchFilteredCards = albumCardSearch.trim() === '' ? [] : allCards.filter(card => 
    card.name.toLowerCase().includes(albumCardSearch.toLowerCase())
  ).slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  const handleExportData = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      collection: collection,
      favorites: favorites,
      customAlbums: customAlbums
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `colecao_yugioh_completa_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="album-container">
      {/* Top Header Controls */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Coleção de Cartas</h2>
      </div>

      {/* Main Catalog vs My Albums Tabs */}
      <div className="no-print" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button 
          className={`btn-secondary ${activeSubTab === 'catalog' ? 'btn-premium' : ''}`}
          onClick={() => { setActiveSubTab('catalog'); setSelectedAlbumId(null); }}
          style={{ flex: 1, padding: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <BookOpenCheck size={15} /> Catálogo Oficial
        </button>
        <button 
          className={`btn-secondary ${activeSubTab === 'my-albums' ? 'btn-premium' : ''}`}
          onClick={() => setActiveSubTab('my-albums')}
          style={{ flex: 1, padding: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Folder size={15} /> Meus Álbuns ({customAlbums.length})
        </button>
      </div>

      {/* RENDER TAB 1: CATALOGO OFICIAL */}
      {activeSubTab === 'catalog' && (
        <>
          {/* Search & Filters */}
          <div className="search-filters-bar no-print">
            <div className="input-row" style={{ position: 'relative' }}>
              <input
                type="text"
                className="textbox"
                placeholder="Buscar por nome, coleção, raridade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            </div>

            {/* Visual Lists Filter Row */}
            <div className="filters-row" style={{ background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                className={`filter-badge ${visualFilter === 'All' ? 'active' : ''}`}
                onClick={() => setVisualFilter('All')}
                style={{ fontSize: '10px', flex: 1 }}
              >
                Todas
              </button>
              <button
                className={`filter-badge ${visualFilter === 'Owned' ? 'active' : ''}`}
                onClick={() => setVisualFilter('Owned')}
                style={{ fontSize: '10px', flex: 1, color: visualFilter === 'Owned' ? '#000' : 'var(--gold)' }}
              >
                Tenho ({collection.filter(c => c.quantity > 0).length})
              </button>
              <button
                className={`filter-badge ${visualFilter === 'Wanted' ? 'active' : ''}`}
                onClick={() => setVisualFilter('Wanted')}
                style={{ fontSize: '10px', flex: 1, color: visualFilter === 'Wanted' ? '#fff' : 'var(--blue)' }}
              >
                Quero ({collection.filter(c => c.wanted && c.wanted > 0).length})
              </button>
              <button
                className={`filter-badge ${visualFilter === 'Favorites' ? 'active' : ''}`}
                onClick={() => setVisualFilter('Favorites')}
                style={{ fontSize: '10px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
              >
                <Star size={10} fill={visualFilter === 'Favorites' ? '#000' : 'none'} /> Favoritas ({favorites.length})
              </button>
            </div>

            {/* Dropdown Filters side-by-side */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', marginBottom: '2px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>TIPO</span>
                <select
                  className="textbox"
                  value={activeTypeFilter}
                  onChange={(e) => setActiveTypeFilter(e.target.value as any)}
                  style={{ padding: '6px 10px', fontSize: '11px', height: '32px', background: 'rgba(20,24,35,0.8)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <option value="All">Todos os Tipos</option>
                  <option value="Monster">Monstro</option>
                  <option value="Spell">Magia (Spell)</option>
                  <option value="Trap">Armadilha (Trap)</option>
                  <option value="Extra">Extra Deck</option>
                </select>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>RARIDADE</span>
                <select
                  className="textbox"
                  value={activeRarityFilter}
                  onChange={(e) => setActiveRarityFilter(e.target.value)}
                  style={{ padding: '6px 10px', fontSize: '11px', height: '32px', background: 'rgba(20,24,35,0.8)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <option value="All">Todas Raridades</option>
                  <option value="Common">Common</option>
                  <option value="Rare">Rare</option>
                  <option value="Super Rare">Super Rare</option>
                  <option value="Ultra Rare">Ultra Rare</option>
                  <option value="Secret Rare">Secret Rare</option>
                </select>
              </div>
            </div>
          </div>

          {/* Collection Stats Header */}
          <div className="no-print" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', padding: '0 4px', marginBottom: '8px' }}>
            <span>Cartas filtradas: {filteredCards.length}</span>
            <span>Total: {collection.reduce((sum, item) => sum + item.quantity, 0)} possuídas / {collection.reduce((sum, item) => sum + (item.wanted || 0), 0)} desejadas</span>
          </div>

          {/* Cards Catalog Grid */}
          <div className="card-grid no-print" style={{ gridTemplateColumns: 'minmax(0, 1fr)', gap: '12px' }}>
            {visibleCards.length === 0 ? (
              <div style={{ gridColumn: '1', textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '40px 0', fontSize: '13px' }}>
                Nenhuma carta encontrada para os filtros selecionados.
              </div>
            ) : (
              visibleCards.map(card => {
                const qtyOwned = getCardQuantity(card.id);
                const qtyWanted = getCardWantedQuantity(card.id);
                const isFav = isFavorite(card.id);
                
                let typeClass = 'monster-card';
                if (card.type === 'Spell') typeClass = 'spell-card';
                else if (card.type === 'Trap') typeClass = 'trap-card';
                else if (card.type === 'Extra') typeClass = 'extra-card';

                return (
                  <div 
                    key={card.id} 
                    className={`ygo-card-item ${typeClass}`} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'row',
                      gap: '12px', 
                      padding: '10px', 
                      position: 'relative',
                      minHeight: '120px',
                      alignItems: 'stretch',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedCardDetail(card)}
                  >
                    {/* Badges para quantidades rápidas no topo */}
                    {qtyOwned > 0 && (
                      <span className="card-qty-badge" style={{ backgroundColor: 'var(--gold)', color: '#000', border: '1px solid #000', fontWeight: '800' }}>
                        {qtyOwned}
                      </span>
                    )}
                    {qtyWanted > 0 && (
                      <span 
                        className="card-qty-badge" 
                        style={{ 
                          backgroundColor: 'var(--blue)', 
                          color: '#fff', 
                          border: '1px solid #000', 
                          right: qtyOwned > 0 ? '34px' : '8px',
                          fontWeight: '800' 
                        }}
                      >
                        {qtyWanted}
                      </span>
                    )}
                    
                    {/* Imagem Oficial Miniatura */}
                    <div style={{ 
                      width: '64px', 
                      borderRadius: '4px', 
                      overflow: 'hidden', 
                      background: '#1a1d24', 
                      flexShrink: 0, 
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                    }}>
                      {card.imageUrlSmall ? (
                        <img 
                          src={card.imageUrlSmall} 
                          alt={card.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>Sem Imagem</div>
                      )}
                    </div>

                    {/* Detalhes da Carta */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <span 
                          className="card-title-text" 
                          style={{ 
                            fontSize: '13px', 
                            fontWeight: '800', 
                            color: '#fff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            cursor: 'pointer',
                            flex: 1,
                            minWidth: 0
                          }}
                          onClick={() => setSelectedCardDetail(card)}
                          title="Clique para ver detalhes"
                        >
                          {card.name}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                          {/* Folder Plus button */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setAddingCardToAlbum(card); }}
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.04)', 
                              border: '1px solid rgba(255, 255, 255, 0.08)', 
                              padding: '4px', 
                              borderRadius: '4px',
                              cursor: 'pointer', 
                              color: 'rgba(255,255,255,0.6)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            title="Organizar em Álbum"
                          >
                            <FolderPlus size={14} />
                          </button>

                          {/* Botão Favorito */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(card.id); }} 
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.04)', 
                              border: '1px solid rgba(255, 255, 255, 0.08)', 
                              padding: '4px', 
                              borderRadius: '4px',
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isFav ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
                              transition: 'all 0.2s'
                            }}
                            title="Favoritar"
                          >
                            <Star size={14} fill={isFav ? 'var(--gold)' : 'none'} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="card-meta-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '-2px', minWidth: 0 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0, display: 'block' }}>
                          {card.originalType} • {card.subType}
                        </span>
                        <span className="rarity-text" style={{ color: 'var(--gold)', fontWeight: '600', flexShrink: 0, marginLeft: '6px' }}>
                          {card.rarity.replace(/Rare/g, 'R.')}
                        </span>
                      </div>

                      {/* Atributos Especiais de Monstro */}
                      {(card.type === 'Monster' || card.type === 'Extra') && card.atk !== undefined && (
                        <div style={{ display: 'flex', gap: '6px', fontSize: '9px', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', alignItems: 'center', flexWrap: 'wrap' }}>
                          {card.attribute && <span className="attribute-tag" style={{ background: 'rgba(255,255,255,0.05)', padding: '1px 4px', borderRadius: '3px', fontSize: '8px', color: '#ffb300' }}>{card.attribute}</span>}
                          <span>LV/RK {card.level}</span>
                          <span style={{ marginLeft: 'auto' }}>ATK {card.atk}</span>
                          <span>DEF {card.def}</span>
                        </div>
                      )}

                      {/* Efeito/Lore */}
                      <p 
                        style={{ 
                          fontSize: '12px', 
                          color: 'rgba(255, 255, 255, 0.85)', 
                          overflow: 'hidden', 
                          display: '-webkit-box', 
                          WebkitLineClamp: 3, 
                          WebkitBoxOrient: 'vertical', 
                          lineHeight: '1.5', 
                          margin: '4px 0 8px 0',
                          fontFamily: 'var(--font-main)'
                        }}
                      >
                        {card.description}
                      </p>

                      {/* Coleção (Texto Opcional) */}
                      {card.collection && (
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '100%', marginBottom: '2px' }}>
                          Coleção: {card.collection}
                        </div>
                      )}

                      {/* Controles de Coleção */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 'auto', paddingTop: '4px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {/* Seletor Tenho */}
                          <div 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '2px', 
                              background: 'rgba(212,175,55,0.04)', 
                              padding: '2px 4px', 
                              borderRadius: '4px', 
                              border: '1px solid rgba(212,175,55,0.15)' 
                            }}
                          >
                            <span style={{ fontSize: '8px', color: 'var(--gold)', fontWeight: 'bold', width: '8px', textAlign: 'center' }}>T</span>
                            <button className="qty-btn" onClick={() => removeFromCollection(card.id, 'owned', 1)} style={{ width: '14px', height: '14px', padding: 0 }} aria-label="Remover Tenho">
                              <Minus size={8} />
                            </button>
                            <span style={{ fontSize: '9px', minWidth: '12px', textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{qtyOwned}</span>
                            <button className="qty-btn" onClick={() => addToCollection(card.id, 'owned', 1)} style={{ width: '14px', height: '14px', padding: 0 }} aria-label="Adicionar Tenho">
                              <Plus size={8} />
                            </button>
                          </div>

                          {/* Seletor Quero */}
                          <div 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '2px', 
                              background: 'rgba(52,152,219,0.04)', 
                              padding: '2px 4px', 
                              borderRadius: '4px', 
                              border: '1px solid rgba(52,152,219,0.15)' 
                            }}
                          >
                            <span style={{ fontSize: '8px', color: 'var(--blue)', fontWeight: 'bold', width: '8px', textAlign: 'center' }}>Q</span>
                            <button className="qty-btn" onClick={() => removeFromCollection(card.id, 'wanted', 1)} style={{ width: '14px', height: '14px', padding: 0 }} aria-label="Remover Quero">
                              <Minus size={8} />
                            </button>
                            <span style={{ fontSize: '9px', minWidth: '12px', textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{qtyWanted}</span>
                            <button className="qty-btn" onClick={() => addToCollection(card.id, 'wanted', 1)} style={{ width: '14px', height: '14px', padding: 0 }} aria-label="Adicionar Quero">
                              <Plus size={8} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Mensagem de paginação se houver mais de 50 */}
          {filteredCards.length > 50 && (
            <div className="no-print" style={{ textAlign: 'center', padding: '16px 0', fontSize: '11px', color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '16px' }}>
              Visualizando as primeiras 50 de {filteredCards.length} cartas encontradas. Refine seus filtros para ver mais.
            </div>
          )}
        </>
      )}

      {/* RENDER TAB 2: MEUS ALBUNS */}
      {activeSubTab === 'my-albums' && (
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {selectedAlbumId === null ? (
            <>
              {/* Albums Directory List */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>Pastas Organizadoras</h3>
                <button 
                  className="btn-premium" 
                  onClick={() => setShowCreateAlbumModal(true)}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  + Criar Novo Álbum
                </button>
              </div>

              {customAlbums.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 16px', color: 'rgba(255,255,255,0.2)' }}>
                  <Folder size={32} style={{ marginBottom: '8px', color: 'rgba(255,255,255,0.1)' }} />
                  <p style={{ fontSize: '12px', margin: 0 }}>Nenhum álbum personalizado criado ainda.</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Divida sua coleção física criando pastas organizadas.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {customAlbums.map(album => (
                    <div 
                      key={album.id}
                      className="glass-panel"
                      onClick={() => setSelectedAlbumId(album.id)}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        padding: '12px 16px',
                        borderLeft: '3px solid var(--gold)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FolderOpen size={20} style={{ color: 'var(--gold)' }} />
                        <div>
                          <strong style={{ fontSize: '13px', color: '#fff' }}>{album.name}</strong>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                            {album.description || 'Sem descrição'} • {album.cardIds.length} cartas
                          </div>
                        </div>
                      </div>

                      <button 
                        className="qty-btn" 
                        onClick={(e) => { e.stopPropagation(); deleteCustomAlbum(album.id); }}
                        style={{ color: 'var(--red)', padding: '6px' }}
                        title="Excluir Álbum"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Inner Album details view
            currentAlbum && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Header Back Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button className="qty-btn" onClick={() => { setSelectedAlbumId(null); setAlbumCardSearch(''); }} style={{ padding: '6px' }}>
                    <ArrowLeft size={14} />
                  </button>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gold)', margin: 0 }}>
                      {currentAlbum.name}
                    </h3>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                      {currentAlbum.description || 'Álbum Personalizado'} • {currentAlbum.cardIds.length} cartas
                    </span>
                  </div>
                </div>

                {/* Card Insertion Box inside the album */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.4)' }}>
                    ADICIONAR CARTA A ESTE ÁLBUM
                  </label>
                  <input
                    type="text"
                    className="textbox"
                    placeholder="Pesquise cartas pelo nome..."
                    value={albumCardSearch}
                    onChange={(e) => setAlbumCardSearch(e.target.value)}
                    style={{ fontSize: '11px', padding: '6px 10px' }}
                  />

                  {/* Dropdown suggestions */}
                  {albumCardSearch.trim() !== '' && (
                    <div style={{ 
                      background: 'rgba(10,12,18,0.95)', 
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      zIndex: 20
                    }}>
                      {albumSearchFilteredCards.length === 0 ? (
                        <div style={{ padding: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                          Nenhuma carta oficial encontrada.
                        </div>
                      ) : (
                        albumSearchFilteredCards.map(card => {
                          const alreadyIn = currentAlbum.cardIds.includes(card.id);
                          return (
                            <div 
                              key={card.id}
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '6px 10px',
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                fontSize: '11px'
                              }}
                            >
                              <span style={{ color: '#fff', fontWeight: '600' }}>{card.name}</span>
                              <button
                                className="quick-lp-btn"
                                onClick={() => {
                                  addCardToCustomAlbum(currentAlbum.id, card.id);
                                  setAlbumCardSearch('');
                                }}
                                disabled={alreadyIn}
                                style={{ padding: '2px 8px', fontSize: '9px' }}
                              >
                                {alreadyIn ? 'Já está' : '+ Adicionar'}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* List cards inside custom album */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {currentAlbum.cardIds.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>
                      Nenhuma carta adicionada a este álbum ainda. Use a caixa acima para pesquisar e incluir.
                    </div>
                  ) : (
                    currentAlbum.cardIds.map(cardId => {
                      const card = allCards.find(c => c.id === cardId);
                      if (!card) return null;

                      let typeClass = 'monster-card';
                      if (card.type === 'Spell') typeClass = 'spell-card';
                      else if (card.type === 'Trap') typeClass = 'trap-card';
                      else if (card.type === 'Extra') typeClass = 'extra-card';

                      return (
                        <div 
                          key={cardId}
                          className={`ygo-card-item ${typeClass}`}
                          style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}
                          onClick={() => setSelectedCardDetail(card)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {card.imageUrlSmall && (
                              <img src={card.imageUrlSmall} alt={card.name} style={{ width: '32px', height: '46px', borderRadius: '2px', objectFit: 'cover' }} />
                            )}
                            <div>
                              <strong style={{ fontSize: '12px', color: '#fff' }}>{card.name}</strong>
                              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                                {card.originalType} • {card.rarity}
                              </div>
                            </div>
                          </div>

                          <button
                            className="qty-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCardFromCustomAlbum(currentAlbum.id, card.id);
                            }}
                            style={{ color: 'var(--red)', padding: '6px' }}
                            title="Remover do Álbum"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Bottom Control Bar */}
      <div 
        className="no-print" 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          marginTop: '16px', 
          borderTop: '1px solid rgba(255,255,255,0.06)', 
          paddingTop: '12px' 
        }}
      >
        <button 
          className="btn-premium" 
          onClick={handleExportData} 
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', padding: '8px 12px' }}
        >
          <Download size={13} /> Exportar Backup
        </button>
        <button 
          className="btn-premium" 
          onClick={handlePrint} 
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', padding: '8px 12px', background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
        >
          <Printer size={13} /> Gerar PDF / Imprimir
        </button>
      </div>

      {/* MODAL: Criar álbum personalizado */}
      {showCreateAlbumModal && (
        <div className="standard-modal-overlay no-print">
          <div className="standard-modal" style={{ maxWidth: '320px' }}>
            <h3 style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: '800' }}>Criar Álbum Personalizado</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0 12px 0' }}>
              <input
                type="text"
                className="textbox"
                placeholder="Nome do Álbum (ex: Cartas Raras)"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
              />
              <input
                type="text"
                className="textbox"
                placeholder="Descrição rápida (opcional)"
                value={newAlbumDesc}
                onChange={(e) => setNewAlbumDesc(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowCreateAlbumModal(false)} style={{ fontSize: '11px', padding: '6px 12px' }}>
                Cancelar
              </button>
              <button 
                className="btn-premium" 
                onClick={handleCreateAlbum} 
                disabled={!newAlbumName.trim()} 
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                Criar Álbum
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Adicionar à pasta (Popup) */}
      {addingCardToAlbum && (
        <div className="standard-modal-overlay no-print" onClick={() => setAddingCardToAlbum(null)}>
          <div 
            className="standard-modal" 
            style={{ maxWidth: '320px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>
              Organizar em Álbum
            </h3>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
              Adicionar <strong>{addingCardToAlbum.name}</strong> a qual álbum?
            </p>

            {customAlbums.length === 0 ? (
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', padding: '12px 0', textAlign: 'center' }}>
                Nenhum álbum personalizado criado. Vá para a aba "Meus Álbuns" para criar um primeiro.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto', marginBottom: '12px' }}>
                {customAlbums.map(album => {
                  const alreadyIn = album.cardIds.includes(addingCardToAlbum.id);
                  return (
                    <button
                      key={album.id}
                      className="btn-secondary"
                      onClick={() => {
                        addCardToCustomAlbum(album.id, addingCardToAlbum.id);
                        setAddingCardToAlbum(null);
                      }}
                      disabled={alreadyIn}
                      style={{ 
                        fontSize: '11px', 
                        padding: '8px 12px', 
                        textAlign: 'left', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{album.name}</span>
                      <span style={{ fontSize: '9px', opacity: 0.5 }}>{alreadyIn ? 'Já inserido' : '+ Vincular'}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setAddingCardToAlbum(null)} style={{ fontSize: '11px', padding: '6px 12px' }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER DETAILED VIEW MODAL */}
      {selectedCardDetail && (
        <CardDetailModal 
          card={selectedCardDetail} 
          onClose={() => setSelectedCardDetail(null)} 
        />
      )}

      {/* Print View Layout */}
      <div className="print-only print-page" style={{ display: 'none' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Yu-Gi-Oh! Time to Duel - Catálogo do Álbum</h1>
        <p style={{ marginBottom: '20px', fontSize: '12px', color: '#666' }}>
          Coleção exportada em: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

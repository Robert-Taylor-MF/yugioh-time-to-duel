import React, { useState } from 'react';
import { useApp, type Deck, type DeckCombo } from '../context/AppContext';
import { CardDetailModal } from '../components/CardDetailModal';
import { 
  Plus, 
  PlusCircle, 
  Trash2, 
  Edit2, 
  ArrowLeft, 
  AlertTriangle, 
  Search, 
  ChartArea as ChartBar, 
  Check, 
  BookOpen, 
  Wand2, 
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { type Card } from '../data/defaultCards';

export const DecksView: React.FC = () => {
  const {
    decks,
    allCards,
    createDeck,
    deleteDeck,
    updateDeck,
    renameDeck
  } = useApp();

  // --- States ---
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckNameInput, setNewDeckNameInput] = useState('');
  
  const [deleteDeckConfirm, setDeleteDeckConfirm] = useState<Deck | null>(null);
  const [isRenamingId, setIsRenamingId] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');

  // Selector modal drawer
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState('');
  const [selectorTypeFilter, setSelectorTypeFilter] = useState<'All' | 'Monster' | 'Spell' | 'Trap' | 'Extra'>('All');

  // Detail Modal state
  const [selectedCardDetail, setSelectedCardDetail] = useState<Card | null>(null);

  // Deck Editor internal sub-tab
  const [editorTab, setEditorTab] = useState<'cards' | 'combos'>('cards');

  // New Combo creation state
  const [showCreateComboModal, setShowCreateComboModal] = useState(false);
  const [comboName, setComboName] = useState('');
  const [comboSteps, setComboSteps] = useState('');
  const [comboSelectedCards, setComboSelectedCards] = useState<string[]>([]);
  const [editingComboId, setEditingComboId] = useState<string | null>(null);

  // Find active deck
  const activeDeck = decks.find(d => d.id === activeDeckId);

  // --- Helpers & Calculations ---
  const validateDeck = (deck: Deck) => {
    const errors: string[] = [];
    if (deck.mainDeck.length < 40) {
      errors.push(`Main Deck possui apenas ${deck.mainDeck.length} cartas (mínimo de 40).`);
    }
    if (deck.mainDeck.length > 60) {
      errors.push(`Main Deck possui ${deck.mainDeck.length} cartas (máximo de 60).`);
    }
    if (deck.extraDeck.length > 15) {
      errors.push(`Extra Deck possui ${deck.extraDeck.length} cartas (máximo de 15).`);
    }
    if (deck.sideDeck.length > 15) {
      errors.push(`Side Deck possui ${deck.sideDeck.length} cartas (máximo de 15).`);
    }

    // Limit of 3 copies per card rule check
    const counts: { [id: string]: number } = {};
    const allIds = [...deck.mainDeck, ...deck.extraDeck, ...deck.sideDeck];
    allIds.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });

    Object.keys(counts).forEach(id => {
      if (counts[id] > 3) {
        const card = allCards.find(c => c.id === id);
        errors.push(`A carta "${card?.name || id}" possui ${counts[id]} cópias (máximo de 3).`);
      }
    });

    return errors;
  };

  const getDeckStats = (deck: Deck) => {
    let monsters = 0;
    let spells = 0;
    let traps = 0;

    deck.mainDeck.forEach(cardId => {
      const card = allCards.find(c => c.id === cardId);
      if (card) {
        if (card.type === 'Monster') monsters++;
        else if (card.type === 'Spell') spells++;
        else if (card.type === 'Trap') traps++;
      }
    });

    const total = deck.mainDeck.length || 1;
    return {
      monsters,
      spells,
      traps,
      monsterPct: (monsters / total) * 100,
      spellPct: (spells / total) * 100,
      trapPct: (traps / total) * 100
    };
  };

  // --- Handlers ---
  const handleCreateNew = () => {
    setNewDeckNameInput('');
    setShowCreateModal(true);
  };

  const submitCreateNew = () => {
    if (!newDeckNameInput.trim()) return;
    const created = createDeck(newDeckNameInput.trim());
    setActiveDeckId(created.id);
    setShowCreateModal(false);
  };

  const handleStartRename = (deck: Deck) => {
    setIsRenamingId(deck.id);
    setRenameInputValue(deck.name);
  };

  const handleSaveRename = (deckId: string) => {
    renameDeck(deckId, renameInputValue.trim());
    setIsRenamingId(null);
  };

  const addCardToDeck = (card: Card, target: 'main' | 'extra' | 'side') => {
    if (!activeDeck) return;

    let main = [...activeDeck.mainDeck];
    let extra = [...activeDeck.extraDeck];
    let side = [...activeDeck.sideDeck];

    // Card limit check (3 max)
    const currentCount = [...main, ...extra, ...side].filter(id => id === card.id).length;
    if (currentCount >= 3) {
      alert(`Você já possui o limite de 3 cópias de "${card.name}" no deck!`);
      return;
    }

    if (target === 'main') {
      if (card.type === 'Extra') {
        alert('Monstros do Extra Deck devem ser adicionados ao Extra Deck!');
        return;
      }
      main.push(card.id);
    } else if (target === 'extra') {
      if (card.type !== 'Extra') {
        alert('Apenas monstros de Extra Deck (Fusão, Sincro, etc.) podem ser colocados aqui!');
        return;
      }
      extra.push(card.id);
    } else if (target === 'side') {
      side.push(card.id);
    }

    updateDeck(activeDeck.id, main, extra, side, activeDeck.combos, activeDeck.strategies);
  };

  const removeCardFromDeck = (cardId: string, target: 'main' | 'extra' | 'side') => {
    if (!activeDeck) return;

    let main = [...activeDeck.mainDeck];
    let extra = [...activeDeck.extraDeck];
    let side = [...activeDeck.sideDeck];

    if (target === 'main') {
      const idx = main.indexOf(cardId);
      if (idx > -1) main.splice(idx, 1);
    } else if (target === 'extra') {
      const idx = extra.indexOf(cardId);
      if (idx > -1) extra.splice(idx, 1);
    } else if (target === 'side') {
      const idx = side.indexOf(cardId);
      if (idx > -1) side.splice(idx, 1);
    }

    updateDeck(activeDeck.id, main, extra, side, activeDeck.combos, activeDeck.strategies);
  };

  // --- Combo Handlers ---
  const handleSaveCombo = () => {
    if (!comboName.trim() || !activeDeck) return;
    const currentCombos = activeDeck.combos || [];
    let updatedCombos;

    if (editingComboId) {
      updatedCombos = currentCombos.map(c => c.id === editingComboId ? {
        ...c,
        name: comboName.trim(),
        cardIds: comboSelectedCards,
        steps: comboSteps.trim()
      } : c);
    } else {
      const newCombo: DeckCombo = {
        id: `combo_${Date.now()}`,
        name: comboName.trim(),
        cardIds: comboSelectedCards,
        steps: comboSteps.trim()
      };
      updatedCombos = [...currentCombos, newCombo];
    }

    updateDeck(activeDeck.id, activeDeck.mainDeck, activeDeck.extraDeck, activeDeck.sideDeck, updatedCombos, activeDeck.strategies);
    
    setComboName('');
    setComboSteps('');
    setComboSelectedCards([]);
    setEditingComboId(null);
    setShowCreateComboModal(false);
  };

  const handleEditCombo = (combo: DeckCombo) => {
    setEditingComboId(combo.id);
    setComboName(combo.name);
    setComboSteps(combo.steps);
    setComboSelectedCards(combo.cardIds || []);
    setShowCreateComboModal(true);
  };

  const handleDeleteCombo = (comboId: string) => {
    if (!activeDeck) return;
    const currentCombos = activeDeck.combos || [];
    updateDeck(
      activeDeck.id, 
      activeDeck.mainDeck, 
      activeDeck.extraDeck, 
      activeDeck.sideDeck, 
      currentCombos.filter(c => c.id !== comboId), 
      activeDeck.strategies
    );
  };

  // Selector filtering
  const selectorFilteredCards = allCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(selectorSearch.toLowerCase()) ||
                          card.subType.toLowerCase().includes(selectorSearch.toLowerCase());
    const matchesType = selectorTypeFilter === 'All' ? true : card.type === selectorTypeFilter;
    return matchesSearch && matchesType;
  });

  const selectorVisibleCards = selectorFilteredCards.slice(0, 50);

  // Render Deck Editor workspace
  if (activeDeck) {
    const validationErrors = validateDeck(activeDeck);
    const stats = getDeckStats(activeDeck);

    // List of unique card IDs in the deck for combo selections
    const uniqueCardIds = Array.from(new Set([
      ...activeDeck.mainDeck,
      ...activeDeck.extraDeck,
      ...activeDeck.sideDeck
    ]));

    return (
      <div className="decks-container" style={{ paddingBottom: '20px' }}>
        {/* Editor Header */}
        <div className="deck-editor-header">
          <button className="tool-btn" onClick={() => { setActiveDeckId(null); setEditorTab('cards'); }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>{activeDeck.name}</h3>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
              Total: {activeDeck.mainDeck.length + activeDeck.extraDeck.length + activeDeck.sideDeck.length} cartas
            </span>
          </div>
          {editorTab === 'cards' && (
            <button className="btn-premium" onClick={() => setShowCardSelector(true)}>
              <Plus size={16} /> Adicionar
            </button>
          )}
        </div>

        {/* Sub-tab Selection */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          <button 
            className={`btn-secondary ${editorTab === 'cards' ? 'btn-premium' : ''}`}
            onClick={() => setEditorTab('cards')}
            style={{ flex: 1, padding: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <BookOpen size={14} /> Estrutura do Deck
          </button>
          <button 
            className={`btn-secondary ${editorTab === 'combos' ? 'btn-premium' : ''}`}
            onClick={() => setEditorTab('combos')}
            style={{ flex: 1, padding: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Wand2 size={14} /> Combos e Estratégias
          </button>
        </div>

        {/* TAB 1: CARDS ESTRUTURA */}
        {editorTab === 'cards' && (
          <>
            {/* Validation Errors Panel */}
            {validationErrors.length > 0 && (
              <div className="validation-toast">
                <AlertTriangle size={16} style={{ color: 'var(--red)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ color: 'var(--red)', fontSize: '12px' }}>Aviso de Regras:</strong>
                  {validationErrors.map((err, i) => (
                    <div key={i} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>• {err}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Deck Section */}
            <div className="deck-editor-section">
              <div className="deck-section-title">
                <span>Main Deck</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{activeDeck.mainDeck.length} / 60</span>
              </div>
              {activeDeck.mainDeck.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>
                  Nenhuma carta. Clique em Adicionar.
                </div>
              ) : (
                <div className="deck-editor-cards-grid">
                  {activeDeck.mainDeck.map((cardId, index) => {
                    const card = allCards.find(c => c.id === cardId);
                    return (
                      <div
                        key={`${cardId}_${index}`}
                        className="editor-card-tag"
                        style={{ cursor: 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}
                      >
                        <span 
                          onClick={() => card && setSelectedCardDetail(card)} 
                          style={{ cursor: 'pointer', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textDecoration: 'underline' }}
                          title="Clique para ver efeito"
                        >
                          {card?.name || 'Carta'}
                        </span>
                        <button 
                          onClick={() => removeCardFromDeck(cardId, 'main')}
                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '9px', padding: '0 2px' }}
                          title="Remover"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Extra Deck Section */}
            <div className="deck-editor-section">
              <div className="deck-section-title">
                <span>Extra Deck (Fusions/Synchros)</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{activeDeck.extraDeck.length} / 15</span>
              </div>
              {activeDeck.extraDeck.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '12px', color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>
                  Nenhum monstro extra.
                </div>
              ) : (
                <div className="deck-editor-cards-grid">
                  {activeDeck.extraDeck.map((cardId, index) => {
                    const card = allCards.find(c => c.id === cardId);
                    return (
                      <div
                        key={`${cardId}_${index}`}
                        className="editor-card-tag"
                        style={{ cursor: 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', borderColor: 'var(--extra-color)' }}
                      >
                        <span 
                          onClick={() => card && setSelectedCardDetail(card)} 
                          style={{ cursor: 'pointer', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textDecoration: 'underline' }}
                          title="Clique para ver efeito"
                        >
                          {card?.name || 'Carta Extra'}
                        </span>
                        <button 
                          onClick={() => removeCardFromDeck(cardId, 'extra')}
                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '9px', padding: '0 2px' }}
                          title="Remover"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Side Deck Section */}
            <div className="deck-editor-section">
              <div className="deck-section-title">
                <span>Side Deck</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{activeDeck.sideDeck.length} / 15</span>
              </div>
              {activeDeck.sideDeck.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '12px', color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>
                  Nenhuma carta de suporte lateral.
                </div>
              ) : (
                <div className="deck-editor-cards-grid">
                  {activeDeck.sideDeck.map((cardId, index) => {
                    const card = allCards.find(c => c.id === cardId);
                    return (
                      <div
                        key={`${cardId}_${index}`}
                        className="editor-card-tag"
                        style={{ cursor: 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}
                      >
                        <span 
                          onClick={() => card && setSelectedCardDetail(card)} 
                          style={{ cursor: 'pointer', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textDecoration: 'underline' }}
                          title="Clique para ver efeito"
                        >
                          {card?.name || 'Carta Side'}
                        </span>
                        <button 
                          onClick={() => removeCardFromDeck(cardId, 'side')}
                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '9px', padding: '0 2px' }}
                          title="Remover"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Deck Stats Dashboard */}
            {activeDeck.mainDeck.length > 0 && (
              <div className="glass-panel chart-container" style={{ marginTop: '12px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 10px 0' }}>
                  <ChartBar size={14} /> Distribuição do Main Deck
                </h4>

                {/* Monsters Bar */}
                <div className="bar-row">
                  <div className="bar-labels">
                    <span>Monstros ({stats.monsters})</span>
                    <span>{Math.round(stats.monsterPct)}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${stats.monsterPct}%`, backgroundColor: 'var(--monster-color)' }}></div>
                  </div>
                </div>

                {/* Spells Bar */}
                <div className="bar-row">
                  <div className="bar-labels">
                    <span>Magias ({stats.spells})</span>
                    <span>{Math.round(stats.spellPct)}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${stats.spellPct}%`, backgroundColor: 'var(--spell-color)' }}></div>
                  </div>
                </div>

                {/* Traps Bar */}
                <div className="bar-row">
                  <div className="bar-labels">
                    <span>Armadilhas ({stats.traps})</span>
                    <span>{Math.round(stats.trapPct)}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${stats.trapPct}%`, backgroundColor: 'var(--trap-color)' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: COMBOS E ESTRATEGIAS */}
        {editorTab === 'combos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* General Strategies Textarea */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ClipboardList size={14} /> Estratégia Geral & Notas do Deck
              </h4>
              <textarea
                className="textbox"
                placeholder="Ex: Condição de vitória, cartas chave na mão inicial, fraquezas contra hand traps..."
                value={activeDeck.strategies || ''}
                onChange={(e) => updateDeck(activeDeck.id, activeDeck.mainDeck, activeDeck.extraDeck, activeDeck.sideDeck, activeDeck.combos, e.target.value)}
                style={{ minHeight: '90px', fontSize: '11px', lineHeight: '1.4', resize: 'vertical' }}
              />
            </div>

            {/* Combos list */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} style={{ color: 'var(--gold)' }} /> Jogadas & Combos
                </h4>
                <button 
                  className="btn-premium" 
                  onClick={() => setShowCreateComboModal(true)}
                  style={{ fontSize: '10px', padding: '4px 10px' }}
                >
                  + Novo Combo
                </button>
              </div>

              {!activeDeck.combos || activeDeck.combos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>
                  Nenhum combo cadastrado para este deck.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeDeck.combos.map(combo => (
                    <div 
                      key={combo.id} 
                      style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        padding: '10px', 
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '12px', color: 'var(--gold)' }}>{combo.name}</strong>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="qty-btn"
                            onClick={() => handleEditCombo(combo)}
                            style={{ color: 'var(--gold)', padding: '4px' }}
                            title="Editar Combo"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button 
                            className="qty-btn"
                            onClick={() => handleDeleteCombo(combo.id)}
                            style={{ color: 'var(--red)', padding: '4px' }}
                            title="Remover Combo"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Mindmap-style visual sequence of connected boxes */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', marginTop: '6px', width: '100%' }}>
                        {/* 1. Header: Key Cards Block */}
                        {combo.cardIds && combo.cardIds.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <div 
                              style={{ 
                                background: 'rgba(212,175,55,0.06)', 
                                border: '1px solid rgba(212,175,55,0.2)', 
                                borderRadius: '8px', 
                                padding: '8px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px',
                                width: '100%'
                              }}
                            >
                              <span style={{ fontSize: '8px', color: 'var(--gold)', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                🎴 Requisitos / Mão Inicial
                              </span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                                {combo.cardIds.map((cardId, index) => {
                                  const card = allCards.find(c => c.id === cardId);
                                  return (
                                    <span 
                                      key={index} 
                                      onClick={() => card && setSelectedCardDetail(card)}
                                      style={{ 
                                        fontSize: '9px', 
                                        background: 'rgba(255,255,255,0.08)', 
                                        border: '1px solid rgba(255,255,255,0.12)', 
                                        padding: '2px 8px', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer', 
                                        color: '#fff',
                                        textDecoration: 'underline',
                                        fontWeight: '600'
                                      }}
                                      title="Ver efeito"
                                    >
                                      {card?.name || 'Carta'}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Dotted connector down to Step 1 */}
                            <div style={{ 
                              height: '16px', 
                              width: '0px', 
                              borderLeft: '2px dashed rgba(212,175,55,0.3)' 
                            }} />
                          </div>
                        )}

                        {/* 2. Step Nodes Sequence */}
                        {(() => {
                          const stepList = combo.steps
                            .split('\n')
                            .map(s => s.trim())
                            .filter(Boolean);

                          if (stepList.length === 0) {
                            return (
                              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', padding: '6px', textAlign: 'center' }}>
                                Nenhum passo descrito.
                              </div>
                            );
                          }

                          return stepList.map((stepText, sIdx) => {
                            // Detect if the step text already starts with something like "Passo 1:", "1.", "1 -", etc.
                            // We will clean the prefix to avoid double labeling.
                            const cleanedText = stepText.replace(/^(passo\s*\d+\s*:|step\s*\d+\s*:|\d+[\s.-:]+)/i, '').trim();
                            const isLast = sIdx === stepList.length - 1;

                            return (
                              <React.Fragment key={sIdx}>
                                <div 
                                  className="mindmap-node"
                                  style={{
                                    width: '100%',
                                    background: 'rgba(16, 20, 30, 0.7)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '10px 12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span 
                                      style={{ 
                                        fontSize: '8px', 
                                        background: 'var(--gold)', 
                                        color: '#000', 
                                        padding: '1px 6px', 
                                        borderRadius: '3px', 
                                        fontWeight: '900',
                                        letterSpacing: '0.5px' 
                                      }}
                                    >
                                      PASSO {sIdx + 1}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: '1.4' }}>
                                    {cleanedText}
                                  </p>
                                </div>

                                {/* Connector down to next step */}
                                {!isLast && (
                                  <div style={{ 
                                    height: '20px', 
                                    width: '2px', 
                                    background: 'linear-gradient(to bottom, rgba(212,175,55,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                  }}>
                                    {/* Arrow icon pointing down */}
                                    <span style={{ color: 'rgba(212,175,55,0.4)', fontSize: '8px', position: 'absolute', bottom: '-4px' }}>▼</span>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card Selector Modal Drawer */}
        {showCardSelector && (
          <div className="card-selector-popup">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: 'var(--gold)', fontSize: '15px', fontWeight: '800' }}>Adicionar ao Deck</h3>
              <button className="tool-btn" onClick={() => setShowCardSelector(false)}>
                Fechar
              </button>
            </div>

            {/* Selector Search Bar */}
            <div className="input-row" style={{ position: 'relative', marginBottom: '10px' }}>
              <input
                type="text"
                className="textbox"
                placeholder="Pesquisar cartas catalogadas..."
                value={selectorSearch}
                onChange={(e) => setSelectorSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            </div>

            {/* Selector Types filters */}
            <div className="filters-row" style={{ marginBottom: '12px' }}>
              {(['All', 'Monster', 'Spell', 'Trap', 'Extra'] as const).map(type => (
                <button
                  key={type}
                  className={`filter-badge ${selectorTypeFilter === type ? 'active' : ''}`}
                  onClick={() => setSelectorTypeFilter(type)}
                  style={{ fontSize: '10px', padding: '4px 10px' }}
                >
                  {type === 'All' ? 'Todos' : type === 'Extra' ? 'Extra' : type}
                </button>
              ))}
            </div>

            {/* Selector Cards Scroll List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectorVisibleCards.map(card => {
                // Check current copy counts
                const mainCount = activeDeck.mainDeck.filter(id => id === card.id).length;
                const extraCount = activeDeck.extraDeck.filter(id => id === card.id).length;
                const sideCount = activeDeck.sideDeck.filter(id => id === card.id).length;
                const totalCount = mainCount + extraCount + sideCount;

                return (
                  <div
                    key={card.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div 
                        onClick={() => setSelectedCardDetail(card)}
                        style={{ fontSize: '12px', fontWeight: '700', color: '#fff', textDecoration: 'underline', cursor: 'pointer' }}
                        title="Clique para ver detalhes"
                      >
                        {card.name}
                      </div>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                        {card.subType} | No deck: <strong>{totalCount}x</strong> (máx. 3)
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {card.type === 'Extra' ? (
                        <button
                          className="quick-lp-btn"
                          onClick={() => addCardToDeck(card, 'extra')}
                          disabled={totalCount >= 3}
                          style={{ padding: '6px 8px', fontSize: '9px', backgroundColor: 'rgba(184, 107, 255, 0.15)', color: 'var(--purple)', border: '1px solid rgba(184, 107, 255, 0.3)' }}
                        >
                          + Extra
                        </button>
                      ) : (
                        <>
                          <button
                            className="quick-lp-btn"
                            onClick={() => addCardToDeck(card, 'main')}
                            disabled={totalCount >= 3}
                            style={{ padding: '6px 8px', fontSize: '9px', backgroundColor: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
                          >
                            + Main
                          </button>
                          <button
                            className="quick-lp-btn"
                            onClick={() => addCardToDeck(card, 'side')}
                            disabled={totalCount >= 3}
                            style={{ padding: '6px 8px', fontSize: '9px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff' }}
                          >
                            + Side
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {selectorFilteredCards.length > 50 && (
                <div style={{ textAlign: 'center', padding: '8px 0', fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                  Mostrando 50 de {selectorFilteredCards.length} cartas. Refine a pesquisa.
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: Novo combo */}
        {showCreateComboModal && (
          <div className="standard-modal-overlay no-print">
            <div className="standard-modal" style={{ maxWidth: '380px', width: '90%' }}>
              <h3 style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: '800' }}>
                {editingComboId ? 'Editar Combo' : 'Adicionar Novo Combo'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0' }}>
                <input
                  type="text"
                  className="textbox"
                  placeholder="Nome da Jogada/Combo (ex: Combo Inicial de 1 Carta)"
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                />
                
                {/* Checkbox selector for deck cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>
                    CARTAS PARTICIPANTES DO COMBO:
                  </label>
                  {uniqueCardIds.length === 0 ? (
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', padding: '6px', textAlign: 'center' }}>
                      Adicione cartas ao deck primeiro.
                    </div>
                  ) : (
                    <div style={{ 
                      maxHeight: '110px', 
                      overflowY: 'auto', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '6px', 
                      background: 'rgba(0,0,0,0.2)', 
                      padding: '8px', 
                      borderRadius: '6px' 
                    }}>
                      {uniqueCardIds.map(cardId => {
                        const card = allCards.find(c => c.id === cardId);
                        if (!card) return null;
                        const isSelected = comboSelectedCards.includes(cardId);
                        return (
                          <label key={cardId} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setComboSelectedCards(prev => prev.filter(id => id !== cardId));
                                } else {
                                  setComboSelectedCards(prev => [...prev, cardId]);
                                }
                              }}
                            />
                            <span style={{ color: '#fff' }}>{card.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <textarea
                  className="textbox"
                  placeholder="Passo 1: Invoque por Invocação-Normal...\nPasso 2: Ative o efeito..."
                  value={comboSteps}
                  onChange={(e) => setComboSteps(e.target.value)}
                  style={{ minHeight: '90px', fontSize: '11px', resize: 'vertical', lineHeight: '1.4' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowCreateComboModal(false);
                    setComboName('');
                    setComboSteps('');
                    setComboSelectedCards([]);
                    setEditingComboId(null);
                  }} 
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-premium" 
                  onClick={handleSaveCombo} 
                  disabled={!comboName.trim() || !comboSteps.trim()}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  Salvar Combo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Render detailed view modal inside deck editor */}
        {selectedCardDetail && (
          <CardDetailModal 
            card={selectedCardDetail} 
            onClose={() => setSelectedCardDetail(null)} 
          />
        )}
      </div>
    );
  }

  // Render List of Decks
  return (
    <div className="decks-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Meus Decks</h2>
        <button className="tool-btn" onClick={handleCreateNew}>
          <PlusCircle size={15} /> Novo Deck
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {decks.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '50px 0', fontSize: '13px' }}>
            Nenhum deck criado. Comece criando um novo deck!
          </div>
        ) : (
          decks.map(deck => (
            <div key={deck.id} className="deck-list-item">
              <div onClick={() => setActiveDeckId(deck.id)} style={{ flex: 1 }}>
                {isRenamingId === deck.id ? (
                  <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      className="textbox"
                      value={renameInputValue}
                      onChange={(e) => setRenameInputValue(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '13px' }}
                    />
                    <button className="qty-btn" onClick={() => handleSaveRename(deck.id)}>
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="deck-name">{deck.name}</div>
                    <div className="deck-count-sub">
                      Main: {deck.mainDeck.length} | Extra: {deck.extraDeck.length} | Side: {deck.sideDeck.length}
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginLeft: '10px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  className="qty-btn"
                  onClick={() => handleStartRename(deck)}
                  title="Renomear Deck"
                  style={{ color: 'var(--gold)' }}
                >
                  <Edit2 size={12} />
                </button>
                <button
                  className="qty-btn"
                  onClick={() => setDeleteDeckConfirm(deck)}
                  title="Excluir Deck"
                  style={{ color: 'var(--red)' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Create Deck Modal */}
      {showCreateModal && (
        <div className="standard-modal-overlay no-print">
          <div className="standard-modal" style={{ maxWidth: '320px' }}>
            <h3 style={{ color: 'var(--gold)', fontSize: '15px', fontWeight: '800' }}>Criar Novo Deck</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0 12px 0' }}>
              <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Nome do seu deck:</label>
              <input
                type="text"
                className="textbox"
                placeholder="Ex: Deck do Mago Negro"
                value={newDeckNameInput}
                onChange={(e) => setNewDeckNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    submitCreateNew();
                  }
                }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)} style={{ fontSize: '11px', padding: '6px 12px' }}>
                Cancelar
              </button>
              <button className="btn-premium" onClick={submitCreateNew} disabled={!newDeckNameInput.trim()} style={{ fontSize: '11px', padding: '6px 12px' }}>
                Criar Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Deck Confirm Modal */}
      {deleteDeckConfirm && (
        <div className="standard-modal-overlay no-print">
          <div className="standard-modal" style={{ maxWidth: '320px' }}>
            <h3 style={{ color: 'var(--red)', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚠️ Excluir Deck
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4', margin: '8px 0 12px 0' }}>
              Deseja mesmo excluir permanentemente o deck <strong>"{deleteDeckConfirm.name}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setDeleteDeckConfirm(null)} style={{ fontSize: '11px', padding: '6px 12px' }}>
                Cancelar
              </button>
              <button
                className="btn-premium"
                onClick={() => {
                  deleteDeck(deleteDeckConfirm.id);
                  setDeleteDeckConfirm(null);
                }}
                style={{
                  fontSize: '11px',
                  padding: '6px 12px',
                  background: 'linear-gradient(135deg, var(--red) 0%, #a31834 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(255, 56, 96, 0.2)'
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  ClipboardList,
  Share2,
  Download,
  Upload
} from 'lucide-react';
import { type Card } from '../data/defaultCards';

interface DeckBoxProps {
  card?: Card;
  onClick?: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
}

const DeckBox: React.FC<DeckBoxProps> = ({ card, onClick, size = 'md' }) => {
  const width = size === 'sm' ? '38px' : size === 'lg' ? '120px' : '70px';
  const height = size === 'sm' ? '52px' : size === 'lg' ? '160px' : '95px';
  
  const cardBackUrl = "https://images.ygoprodeck.com/images/cards/back.jpg";
  const bgImage = card ? card.imageUrlSmall || card.imageUrl : cardBackUrl;

  return (
    <div 
      onClick={onClick}
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: '5px',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: card ? '1.5px solid var(--gold)' : '1.5px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.15)',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        flexShrink: 0
      }}
      title={card ? `Capa: ${card.name}` : "Sem capa (clique para definir)"}
    >
      {/* Lid flap detail */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '12%',
        background: card ? 'linear-gradient(to bottom, var(--gold), #966e14)' : 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
        borderBottom: '1px solid rgba(0,0,0,0.3)',
        zIndex: 2
      }} />

      {/* Glossy sheen */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />
    </div>
  );
};

interface EditorCardThumbnailProps {
  card: Card;
  isCover: boolean;
  onView: () => void;
  onRemove: () => void;
  onSetCover: () => void;
}

const EditorCardThumbnail: React.FC<EditorCardThumbnailProps> = ({
  card,
  isCover,
  onView,
  onRemove,
  onSetCover
}) => {
  return (
    <div 
      style={{
        width: '54px',
        height: '78px',
        position: 'relative',
        cursor: 'pointer',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        transition: 'transform 0.15s ease',
        margin: '4px',
        flexShrink: 0
      }}
      className="editor-card-thumbnail"
    >
      <img
        src={card.imageUrlSmall || card.imageUrl}
        alt={card.name}
        onClick={onView}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '3px',
          border: isCover ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)'
        }}
        title={`${card.name} (Clique para ver detalhes)`}
      />

      {/* Set Cover Star Overlay */}
      <button
        onClick={(e) => { e.stopPropagation(); onSetCover(); }}
        style={{
          position: 'absolute',
          top: '-5px',
          left: '-5px',
          background: isCover ? 'var(--gold)' : 'rgba(0, 0, 0, 0.75)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: isCover ? '#000' : 'rgba(255, 255, 255, 0.7)',
          borderRadius: '50%',
          width: '16px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '9px',
          fontWeight: 'bold',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
          zIndex: 5,
          padding: 0
        }}
        title={isCover ? "Capa do deck ativa" : "Definir como capa"}
      >
        ★
      </button>

      {/* Remove Overlay */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          background: 'rgba(255, 56, 96, 0.95)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: '#fff',
          borderRadius: '50%',
          width: '16px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '8px',
          fontWeight: 'bold',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
          zIndex: 5,
          padding: 0
        }}
        title="Remover do deck"
      >
        ✕
      </button>
    </div>
  );
};

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
  const [showCoverSelector, setShowCoverSelector] = useState(false);
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

  // Export/Import states
  const [showExportModal, setShowExportModal] = useState<Deck | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCodeInput, setImportCodeInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [copiedYdkNotification, setCopiedYdkNotification] = useState(false);

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

  // --- Export / Import Handlers ---
  const handleExportJSON = (deck: Deck) => {
    const exportData = {
      name: deck.name,
      mainDeck: deck.mainDeck,
      extraDeck: deck.extraDeck,
      sideDeck: deck.sideDeck,
      combos: deck.combos || [],
      strategies: deck.strategies || '',
      coverCardId: deck.coverCardId
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_deck.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(null);
  };

  const handleCopyShareCode = (deck: Deck) => {
    const exportData = {
      name: deck.name,
      mainDeck: deck.mainDeck,
      extraDeck: deck.extraDeck,
      sideDeck: deck.sideDeck,
      combos: deck.combos || [],
      strategies: deck.strategies || '',
      coverCardId: deck.coverCardId
    };
    try {
      const jsonStr = JSON.stringify(exportData);
      const base64Str = btoa(unescape(encodeURIComponent(jsonStr)));
      navigator.clipboard.writeText(base64Str);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    } catch (err) {
      console.error('Failed to copy share code', err);
    }
  };

  const generateYDKContent = (deck: Deck): string => {
    let content = '#created by Yu-Gi-Oh! Time to Duel\n';
    
    content += '#main\n';
    deck.mainDeck.forEach(id => {
      content += `${id}\n`;
    });
    
    content += '#extra\n';
    deck.extraDeck.forEach(id => {
      content += `${id}\n`;
    });
    
    content += '!side\n';
    deck.sideDeck.forEach(id => {
      content += `${id}\n`;
    });
    
    return content;
  };

  const handleCopyYDKText = (deck: Deck) => {
    try {
      const ydkText = generateYDKContent(deck);
      navigator.clipboard.writeText(ydkText);
      setCopiedYdkNotification(true);
      setTimeout(() => setCopiedYdkNotification(false), 2000);
    } catch (err) {
      console.error('Failed to copy YDK text', err);
    }
  };

  const handleExportYDKFile = (deck: Deck) => {
    const ydkText = generateYDKContent(deck);
    const blob = new Blob([ydkText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ydk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(null);
  };

  const parseYDK = (text: string) => {
    const lines = text.split(/\r?\n/).map(l => l.trim());
    const mainDeck: string[] = [];
    const extraDeck: string[] = [];
    const sideDeck: string[] = [];
    
    let currentSection: 'main' | 'extra' | 'side' | null = null;
    
    for (const line of lines) {
      if (line.startsWith('#main')) {
        currentSection = 'main';
      } else if (line.startsWith('#extra')) {
        currentSection = 'extra';
      } else if (line.startsWith('#side') || line.startsWith('!side')) {
        currentSection = 'side';
      } else if (line.startsWith('#') || line.startsWith('!')) {
        continue;
      } else {
        const passcode = line.split(' ')[0].trim();
        if (/^\d+$/.test(passcode)) {
          if (currentSection === 'main') {
            mainDeck.push(passcode);
          } else if (currentSection === 'extra') {
            extraDeck.push(passcode);
          } else if (currentSection === 'side') {
            sideDeck.push(passcode);
          }
        }
      }
    }
    
    return { mainDeck, extraDeck, sideDeck };
  };

  const parseTXT = (text: string) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const mainDeck: string[] = [];
    const extraDeck: string[] = [];
    const sideDeck: string[] = [];
    
    const isPasscodeList = lines.slice(0, 5).every(line => /^\d+$/.test(line));
    
    if (isPasscodeList) {
      lines.forEach(line => {
        if (/^\d+$/.test(line)) {
          mainDeck.push(line);
        }
      });
      return { mainDeck, extraDeck, sideDeck };
    }
    
    let inSideSection = false;
    
    for (const line of lines) {
      const upper = line.toUpperCase();
      if (upper.includes('SIDE DECK') || upper.includes('SIDEBOARD') || upper.startsWith('SIDE:')) {
        inSideSection = true;
        continue;
      }
      if (upper.includes('MAIN DECK') || upper.includes('EXTRA DECK')) {
        inSideSection = false;
        continue;
      }
      
      const match = line.match(/^(?:(\d+)\s*[xX]?\s+)?(.+)$/);
      if (match) {
        const qty = match[1] ? parseInt(match[1], 10) : 1;
        const cardName = match[2].trim();
        
        const foundCard = allCards.find(c => c.name.toLowerCase() === cardName.toLowerCase());
        if (foundCard) {
          const listToPush = inSideSection 
            ? sideDeck 
            : (foundCard.type === 'Extra' ? extraDeck : mainDeck);
            
          for (let i = 0; i < qty; i++) {
            listToPush.push(foundCard.id);
          }
        }
      }
    }
    
    return { mainDeck, extraDeck, sideDeck };
  };

  const handleImportFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.ydk') || text.includes('#main') || text.includes('#extra')) {
          const parsed = parseYDK(text);
          executeImportYDK(file.name.replace('.ydk', ''), parsed);
        } else if (fileName.endsWith('.txt')) {
          const parsed = parseTXT(text);
          executeImportYDK(file.name.replace('.txt', ''), parsed);
        } else {
          try {
            const data = JSON.parse(text);
            executeImport(data);
          } catch (e) {
            if (text.includes('#main') || text.includes('#extra')) {
              const parsed = parseYDK(text);
              executeImportYDK(file.name, parsed);
            } else {
              const parsed = parseTXT(text);
              executeImportYDK(file.name, parsed);
            }
          }
        }
      } catch (err) {
        setImportError('Erro ao ler arquivo: formato inválido ou não suportado.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportFromCode = () => {
    const rawInput = importCodeInput.trim();
    if (!rawInput) return;
    setImportError(null);
    
    if (rawInput.includes('#main') || rawInput.includes('#extra')) {
      const parsed = parseYDK(rawInput);
      executeImportYDK('Deck Importado YDK', parsed);
      return;
    }
    
    const lines = rawInput.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(rawInput) && !rawInput.includes(' ');
    
    if (lines.length > 1 && !isBase64) {
      const parsed = parseTXT(rawInput);
      executeImportYDK('Deck Importado TXT', parsed);
      return;
    }
    
    try {
      const decodedStr = decodeURIComponent(escape(atob(rawInput)));
      const data = JSON.parse(decodedStr);
      executeImport(data);
    } catch (err) {
      setImportError('Erro ao ler código: Formato de código de compartilhamento, YDK ou TXT inválido.');
    }
  };

  const executeImport = (data: any) => {
    if (!data || typeof data !== 'object') {
      setImportError('Dados inválidos.');
      return;
    }
    const name = typeof data.name === 'string' ? data.name : 'Deck Importado';
    const mainDeck = Array.isArray(data.mainDeck) ? data.mainDeck.map(String) : [];
    const extraDeck = Array.isArray(data.extraDeck) ? data.extraDeck.map(String) : [];
    const sideDeck = Array.isArray(data.sideDeck) ? data.sideDeck.map(String) : [];
    const combos = Array.isArray(data.combos) ? data.combos.map((c: any) => ({
      id: c.id || `combo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: typeof c.name === 'string' ? c.name : 'Combo Sem Nome',
      cardIds: Array.isArray(c.cardIds) ? c.cardIds.map(String) : [],
      steps: typeof c.steps === 'string' ? c.steps : ''
    })) : [];
    const strategies = typeof data.strategies === 'string' ? data.strategies : '';
    const coverCardId = typeof data.coverCardId === 'string' ? data.coverCardId : null;

    const newDeck = createDeck(name);
    updateDeck(newDeck.id, mainDeck, extraDeck, sideDeck, combos, strategies, coverCardId);

    setImportCodeInput('');
    setImportError(null);
    setShowImportModal(false);
  };

  const executeImportYDK = (deckName: string, parsedDeck: { mainDeck: string[], extraDeck: string[], sideDeck: string[] }) => {
    const validMain = parsedDeck.mainDeck.filter(id => allCards.some(c => c.id === id));
    const validExtra = parsedDeck.extraDeck.filter(id => allCards.some(c => c.id === id));
    const validSide = parsedDeck.sideDeck.filter(id => allCards.some(c => c.id === id));
    
    if (validMain.length === 0 && validExtra.length === 0 && validSide.length === 0) {
      setImportError('Nenhuma carta correspondente encontrada no banco de dados do aplicativo.');
      return;
    }
    
    const name = deckName || 'Deck Importado';
    const newDeck = createDeck(name);
    
    updateDeck(
      newDeck.id, 
      validMain, 
      validExtra, 
      validSide, 
      [], 
      '', 
      validMain[0] || validExtra[0] || null
    );
    
    setShowImportModal(false);
    setImportCodeInput('');
    setImportError(null);
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
        <div className="deck-editor-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="tool-btn" onClick={() => { setActiveDeckId(null); setEditorTab('cards'); }} style={{ flexShrink: 0 }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          
          <DeckBox 
            card={allCards.find(c => c.id === activeDeck.coverCardId)} 
            size="sm" 
            onClick={() => setShowCoverSelector(true)} 
          />

          <div style={{ textAlign: 'left', flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: '0 0 2px 0' }}>{activeDeck.name}</h3>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'block' }}>
              Total: {activeDeck.mainDeck.length + activeDeck.extraDeck.length + activeDeck.sideDeck.length} cartas
            </span>
          </div>
          {editorTab === 'cards' && (
            <button className="btn-premium" onClick={() => setShowCardSelector(true)} style={{ flexShrink: 0 }}>
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
                <div className="deck-editor-cards-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px' }}>
                  {activeDeck.mainDeck.map((cardId, index) => {
                    const card = allCards.find(c => c.id === cardId);
                    if (!card) return null;
                    return (
                      <EditorCardThumbnail
                        key={`${cardId}_${index}`}
                        card={card}
                        isCover={activeDeck.coverCardId === cardId}
                        onView={() => setSelectedCardDetail(card)}
                        onRemove={() => removeCardFromDeck(cardId, 'main')}
                        onSetCover={() => updateDeck(activeDeck.id, activeDeck.mainDeck, activeDeck.extraDeck, activeDeck.sideDeck, activeDeck.combos, activeDeck.strategies, cardId)}
                      />
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
                <div className="deck-editor-cards-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px' }}>
                  {activeDeck.extraDeck.map((cardId, index) => {
                    const card = allCards.find(c => c.id === cardId);
                    if (!card) return null;
                    return (
                      <EditorCardThumbnail
                        key={`${cardId}_${index}`}
                        card={card}
                        isCover={activeDeck.coverCardId === cardId}
                        onView={() => setSelectedCardDetail(card)}
                        onRemove={() => removeCardFromDeck(cardId, 'extra')}
                        onSetCover={() => updateDeck(activeDeck.id, activeDeck.mainDeck, activeDeck.extraDeck, activeDeck.sideDeck, activeDeck.combos, activeDeck.strategies, cardId)}
                      />
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
                <div className="deck-editor-cards-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px' }}>
                  {activeDeck.sideDeck.map((cardId, index) => {
                    const card = allCards.find(c => c.id === cardId);
                    if (!card) return null;
                    return (
                      <EditorCardThumbnail
                        key={`${cardId}_${index}`}
                        card={card}
                        isCover={activeDeck.coverCardId === cardId}
                        onView={() => setSelectedCardDetail(card)}
                        onRemove={() => removeCardFromDeck(cardId, 'side')}
                        onSetCover={() => updateDeck(activeDeck.id, activeDeck.mainDeck, activeDeck.extraDeck, activeDeck.sideDeck, activeDeck.combos, activeDeck.strategies, cardId)}
                      />
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

        {/* Cover Selector Modal */}
        {showCoverSelector && activeDeck && (
          <div className="standard-modal-overlay no-print" onClick={() => setShowCoverSelector(false)}>
            <div className="standard-modal" style={{ maxWidth: '360px', width: '95%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ color: 'var(--gold)', fontSize: '15px', fontWeight: '800', margin: '0 0 12px 0' }}>
                Selecionar Capa do Deck
              </h3>
              
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                Escolha uma carta do seu deck para ilustrar o deck box:
              </p>

              {uniqueCardIds.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                  Adicione cartas ao deck antes de escolher a capa.
                </div>
              ) : (
                <div style={{ 
                  maxHeight: '220px', 
                  overflowY: 'auto', 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '8px',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  {uniqueCardIds.map(cardId => {
                    const card = allCards.find(c => c.id === cardId);
                    if (!card) return null;
                    return (
                      <div
                        key={cardId}
                        onClick={() => {
                          updateDeck(activeDeck.id, activeDeck.mainDeck, activeDeck.extraDeck, activeDeck.sideDeck, activeDeck.combos, activeDeck.strategies, card.id);
                          setShowCoverSelector(false);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '6px',
                          border: activeDeck.coverCardId === cardId ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.05)',
                          background: activeDeck.coverCardId === cardId ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                          transition: 'all 0.2s'
                        }}
                        className="cover-select-option"
                      >
                        <img 
                          src={card.imageUrlSmall || card.imageUrl} 
                          alt={card.name} 
                          style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                        />
                        <span style={{ fontSize: '8px', color: '#fff', textAlign: 'center', width: '100%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '2px' }}>
                          {card.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                {activeDeck.coverCardId && (
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      updateDeck(activeDeck.id, activeDeck.mainDeck, activeDeck.extraDeck, activeDeck.sideDeck, activeDeck.combos, activeDeck.strategies, null);
                      setShowCoverSelector(false);
                    }}
                    style={{ fontSize: '11px', padding: '6px 12px', border: '1px solid var(--red)', color: 'var(--red)' }}
                  >
                    Remover Capa
                  </button>
                )}
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowCoverSelector(false)} 
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render List of Decks
  return (
    <div className="decks-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Meus Decks</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="tool-btn" onClick={() => { setShowImportModal(true); setImportError(null); setImportCodeInput(''); }} title="Importar deck por arquivo JSON ou código">
            <Upload size={13} /> Importar
          </button>
          <button className="tool-btn" onClick={handleCreateNew}>
            <PlusCircle size={15} /> Novo Deck
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {decks.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '50px 0', fontSize: '13px' }}>
            Nenhum deck criado. Comece criando um novo deck!
          </div>
        ) : (
          decks.map(deck => {
            const coverCard = allCards.find(c => c.id === deck.coverCardId);
            return (
              <div key={deck.id} className="deck-list-item" style={{ display: 'flex', gap: '12px', alignItems: 'center' }} onClick={() => setActiveDeckId(deck.id)}>
                <DeckBox card={coverCard} size="sm" />
                <div style={{ flex: 1 }}>
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
                  onClick={() => setShowExportModal(deck)}
                  title="Compartilhar / Exportar"
                  style={{ color: '#60a5fa' }}
                >
                  <Share2 size={12} />
                </button>
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
        );
      })
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

      {/* Export Deck Modal */}
      {showExportModal && (
        <div className="standard-modal-overlay no-print" onClick={() => setShowExportModal(null)}>
          <div className="standard-modal" style={{ maxWidth: '360px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--gold)', fontSize: '15px', fontWeight: '800', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Share2 size={16} /> Compartilhar Deck
            </h3>
            
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4', marginBottom: '14px' }}>
              Escolha o formato ideal para compartilhar o deck <strong>"{showExportModal.name}"</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Group A: App Format */}
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  A: Formato do Aplicativo (Completo com Combos/Caixa)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    className="btn-premium" 
                    onClick={() => handleCopyShareCode(showExportModal)}
                    style={{ 
                      fontSize: '11px', 
                      padding: '8px 12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px' 
                    }}
                  >
                    {copiedNotification ? (
                      <>✓ Código Copiado!</>
                    ) : (
                      <>
                        <ClipboardList size={13} /> Copiar Código de Compartilhamento
                      </>
                    )}
                  </button>
                  
                  <button 
                    className="btn-secondary" 
                    onClick={() => handleExportJSON(showExportModal)}
                    style={{ 
                      fontSize: '11px', 
                      padding: '8px 12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px' 
                    }}
                  >
                    <Download size={13} style={{ color: 'var(--gold)' }} /> Baixar Arquivo (.json)
                  </button>
                </div>
              </div>

              {/* Group B: Simulator Format */}
              <div style={{ paddingBottom: '10px' }}>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  B: Formato de Simuladores (YGOPRO / Dueling Book / YGOPRODeck)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    className="btn-premium" 
                    onClick={() => handleCopyYDKText(showExportModal)}
                    style={{ 
                      fontSize: '11px', 
                      padding: '8px 12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px',
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                    }}
                  >
                    {copiedYdkNotification ? (
                      <>✓ Texto YDK Copiado!</>
                    ) : (
                      <>
                        <ClipboardList size={13} /> Copiar Texto no Formato YDK
                      </>
                    )}
                  </button>
                  
                  <button 
                    className="btn-secondary" 
                    onClick={() => handleExportYDKFile(showExportModal)}
                    style={{ 
                      fontSize: '11px', 
                      padding: '8px 12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px' 
                    }}
                  >
                    <Download size={13} style={{ color: '#3b82f6' }} /> Baixar Arquivo (.ydk)
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn-secondary" onClick={() => setShowExportModal(null)} style={{ fontSize: '11px', padding: '6px 12px' }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Deck Modal */}
      {showImportModal && (
        <div className="standard-modal-overlay no-print" onClick={() => setShowImportModal(false)}>
          <div className="standard-modal" style={{ maxWidth: '360px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--gold)', fontSize: '15px', fontWeight: '800', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Upload size={16} /> Importar Deck
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Option A: File upload */}
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <label style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                  OPÇÃO A: IMPORTAR ARQUIVO (.JSON, .YDK, .TXT)
                </label>
                <input 
                  type="file" 
                  accept=".json,.ydk,.txt" 
                  onChange={handleImportFromFile}
                  style={{ display: 'none' }}
                  id="deck-file-import-input"
                />
                <label 
                  htmlFor="deck-file-import-input" 
                  className="btn-secondary"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    padding: '8px 12px', 
                    fontSize: '11px', 
                    cursor: 'pointer',
                    borderRadius: '6px',
                    border: '1px dashed var(--gold)',
                    background: 'rgba(212, 175, 55, 0.04)'
                  }}
                >
                  <Download size={14} style={{ color: 'var(--gold)' }} /> Escolher arquivo do deck
                </label>
              </div>

              {/* Option B: Share code */}
              <div>
                <label style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                  OPÇÃO B: IMPORTAR POR CÓDIGO, TEXTO OU YDK COPIADO
                </label>
                <textarea
                  className="textbox"
                  placeholder="Cole o código de compartilhamento, texto YDK ou lista de cartas aqui..."
                  value={importCodeInput}
                  onChange={e => { setImportCodeInput(e.target.value); setImportError(null); }}
                  style={{ minHeight: '80px', fontSize: '10px', resize: 'vertical', lineHeight: '1.4', fontFamily: 'monospace' }}
                />
                <button
                  className="btn-premium"
                  onClick={handleImportFromCode}
                  disabled={!importCodeInput.trim()}
                  style={{ width: '100%', fontSize: '11px', padding: '8px 12px', marginTop: '6px' }}
                >
                  Confirmar Importação
                </button>
              </div>

              {importError && (
                <div style={{ color: 'var(--red)', fontSize: '10px', textAlign: 'center', marginTop: '4px' }}>
                  ⚠️ {importError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowImportModal(false);
                  setImportCodeInput('');
                  setImportError(null);
                }} 
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

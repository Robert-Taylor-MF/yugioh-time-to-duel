import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, Undo2, Dice5, Coins, Edit3, Check, X, Volume2, VolumeX } from 'lucide-react';

export const DuelView: React.FC = () => {
  const {
    p1Lp,
    p2Lp,
    p1Name,
    p2Name,
    duelLogs,
    modifyLp,
    undoLastAction,
    resetDuel,
    rollDice,
    flipCoin,
    updatePlayerNames,
    profile,
    updateProfile,
    decks,
    allCards,
    deckCardStates,
    updateCardState
  } = useApp();

  // --- Favorite Deck ---
  const favoriteDeck = decks.find(d => d.id === profile.favoriteDeckId);
  const [showDeckPanel, setShowDeckPanel] = useState(false);
  const [deckPanelTab, setDeckPanelTab] = useState<'main' | 'extra'>('main');
  const [searchQuery, setSearchQuery] = useState('');

  // --- States ---
  const [selectedPlayer, setSelectedPlayer] = useState<1 | 2>(1);
  const [calcInput, setCalcInput] = useState<string>('');
  const [calcSign, setCalcSign] = useState<'+' | '-'>('-');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const [showCoin, setShowCoin] = useState(false);
  const [coinResult, setCoinResult] = useState<'Heads' | 'Tails' | null>(null);
  const [isCoinFlipping, setIsCoinFlipping] = useState(false);

  const [showDice, setShowDice] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isDiceRolling, setIsDiceRolling] = useState(false);

  const [isEditingNames, setIsEditingNames] = useState(false);
  const [tempP1Name, setTempP1Name] = useState(p1Name);
  const [tempP2Name, setTempP2Name] = useState(p2Name);

  // Sound simulation (UI Haptic Feedback)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- Duel Outcome Modal ---
  const [duelOutcome, setDuelOutcome] = useState<'victory' | 'defeat' | null>(null);

  React.useEffect(() => {
    if (p1Lp === 0 && p2Lp > 0) {
      setDuelOutcome('defeat');
    } else if (p2Lp === 0 && p1Lp > 0) {
      setDuelOutcome('victory');
    } else {
      setDuelOutcome(null);
    }
  }, [p1Lp, p2Lp]);

  const handleConfirmOutcome = () => {
    if (duelOutcome === 'victory') {
      updateProfile({ wins: (profile.wins || 0) + 1 });
    } else if (duelOutcome === 'defeat') {
      updateProfile({ losses: (profile.losses || 0) + 1 });
    }
    resetDuel();
    setDuelOutcome(null);
  };

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08); // 80ms duration
    } catch (e) {
      // Audio context might be blocked or unsupported
    }
  };

  // --- Handlers ---
  const handleNumPress = (val: string) => {
    playBeep();
    if (calcInput.length >= 5) return; // Limit to 5 digits (99999)
    setCalcInput(prev => prev + val);
  };

  const handleClear = () => {
    playBeep();
    setCalcInput('');
  };

  const handleToggleSign = () => {
    playBeep();
    setCalcSign(prev => prev === '+' ? '-' : '+');
  };

  const handleEnter = () => {
    if (!calcInput) return;
    playBeep();
    const amount = parseInt(calcInput, 10);
    const multiplier = calcSign === '+' ? 1 : -1;
    modifyLp(selectedPlayer, amount * multiplier);
    setCalcInput('');
  };

  const handleQuickLp = (amount: number) => {
    playBeep();
    modifyLp(selectedPlayer, amount);
  };

  const triggerCoinFlip = () => {
    setIsCoinFlipping(true);
    setCoinResult(null);
    playBeep();
    setTimeout(() => {
      const res = flipCoin();
      setCoinResult(res);
      setIsCoinFlipping(false);
    }, 1200);
  };

  const triggerDiceRoll = () => {
    setIsDiceRolling(true);
    setDiceResult(null);
    playBeep();
    setTimeout(() => {
      const res = rollDice();
      setDiceResult(res);
      setIsDiceRolling(false);
    }, 1200);
  };

  const saveNames = () => {
    playBeep();
    updatePlayerNames(tempP1Name, tempP2Name);
    setIsEditingNames(false);
  };

  const cancelNames = () => {
    playBeep();
    setTempP1Name(p1Name);
    setTempP2Name(p2Name);
    setIsEditingNames(false);
  };

  return (
    <div className="duel-container">
      {/* P1 & P2 LP Panels */}
      <div className="lp-screens">
        {/* Player 1 Box */}
        <div
          onClick={() => setSelectedPlayer(1)}
          className={`lp-player-box p1-side ${selectedPlayer === 1 ? 'selected' : ''}`}
          style={{ position: 'relative' }}
        >
          <div className="player-name-tag">
            <span>{p1Name}</span>
            {selectedPlayer === 1 && <span style={{ color: 'var(--gold)', fontSize: '10px' }}>● ALVO</span>}
          </div>
          <div className="lp-value">{p1Lp}</div>
          
          {/* Deck Box Floating Trigger */}
          {favoriteDeck ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playBeep();
                setShowDeckPanel(true);
              }}
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: 'var(--gold)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '9px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                transition: 'all 0.2s'
              }}
              className="premium-btn-hover"
              title={`Ver Deck: ${favoriteDeck.name}`}
            >
              📦 {favoriteDeck.name.substring(0, 12)}{favoriteDeck.name.length > 12 ? '...' : ''} ({favoriteDeck.mainDeck.length})
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playBeep();
                alert('Defina seu deck favorito no perfil para interagir com suas cartas durante o duelo!');
              }}
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '9px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              📦 Sem Deck
            </button>
          )}
        </div>

        {/* Player 2 Box */}
        <div
          onClick={() => setSelectedPlayer(2)}
          className={`lp-player-box p2-side ${selectedPlayer === 2 ? 'selected' : ''}`}
        >
          <div className="player-name-tag">
            <span>{p2Name}</span>
            {selectedPlayer === 2 && <span style={{ color: 'var(--blue)', fontSize: '10px' }}>● ALVO</span>}
          </div>
          <div className="lp-value">{p2Lp}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="duel-toolbar no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', padding: '8px 12px' }}>
        <button 
          className="tool-btn" 
          onClick={() => setShowCoin(true)} 
          aria-label="Lançar Moeda" 
          title="Lançar Moeda"
          style={{ flex: 1, height: '36px', padding: 0, justifyContent: 'center', borderRadius: '8px' }}
        >
          <Coins size={16} />
        </button>
        <button 
          className="tool-btn" 
          onClick={() => setShowDice(true)} 
          aria-label="Rolar Dado" 
          title="Rolar Dado"
          style={{ flex: 1, height: '36px', padding: 0, justifyContent: 'center', borderRadius: '8px' }}
        >
          <Dice5 size={16} />
        </button>
        <button 
          className="tool-btn" 
          onClick={() => setSoundEnabled(prev => !prev)} 
          aria-label="Alternar Som" 
          title="Alternar Som"
          style={{ flex: 1, height: '36px', padding: 0, justifyContent: 'center', borderRadius: '8px' }}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <button 
          className="tool-btn" 
          onClick={() => setIsEditingNames(true)} 
          aria-label="Editar Nomes" 
          title="Editar Nomes"
          style={{ flex: 1, height: '36px', padding: 0, justifyContent: 'center', borderRadius: '8px' }}
        >
          <Edit3 size={16} />
        </button>
        <button 
          className="tool-btn" 
          onClick={undoLastAction} 
          aria-label="Desfazer" 
          title="Desfazer"
          style={{ flex: 1, height: '36px', padding: 0, justifyContent: 'center', borderRadius: '8px' }}
        >
          <Undo2 size={16} />
        </button>
        <button
          className="tool-btn reset-btn"
          onClick={() => {
            playBeep();
            setShowResetConfirm(true);
          }}
          aria-label="Reiniciar"
          title="Reiniciar"
          style={{ 
            flex: 1, 
            height: '36px', 
            padding: 0, 
            justifyContent: 'center', 
            borderRadius: '8px', 
            background: 'rgba(255, 75, 75, 0.08)', 
            border: '1px solid rgba(255, 75, 75, 0.25)', 
            color: '#ff4b4b' 
          }}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Input Display Bar */}
      <div className="current-input-display no-print">
        <div className={`input-target-badge ${selectedPlayer === 1 ? 'p1' : 'p2'}`}>
          Para: {selectedPlayer === 1 ? p1Name : p2Name}
        </div>
        <div className="input-value-preview">
          {calcInput ? `${calcSign} ${calcInput}` : '0'}
        </div>
      </div>

      {/* LP Calculator Panel */}
      <div className="lp-controls-panel no-print">
        {/* Quick Damage / Heal Buttons */}
        <div className="quick-buttons-row">
          <button className="quick-lp-btn" onClick={() => handleQuickLp(-100)}>-100</button>
          <button className="quick-lp-btn" onClick={() => handleQuickLp(-500)}>-500</button>
          <button className="quick-lp-btn" onClick={() => handleQuickLp(-1000)}>-1000</button>
          <button className="quick-lp-btn" onClick={() => handleQuickLp(-2000)}>-2000</button>
          <button className="quick-lp-btn" onClick={() => handleQuickLp(100)}>+100</button>
          <button className="quick-lp-btn" onClick={() => handleQuickLp(500)}>+500</button>
          <button className="quick-lp-btn" onClick={() => handleQuickLp(1000)}>+1000</button>
          <button className="quick-lp-btn" onClick={() => handleQuickLp(2000)}>+2000</button>
        </div>

        {/* Numeric Calculator Grid */}
        <div className="calculator-grid">
          <button className="calc-btn" onClick={() => handleNumPress('7')}>7</button>
          <button className="calc-btn" onClick={() => handleNumPress('8')}>8</button>
          <button className="calc-btn" onClick={() => handleNumPress('9')}>9</button>
          <button className="calc-btn clear-btn" onClick={handleClear}>C</button>

          <button className="calc-btn" onClick={() => handleNumPress('4')}>4</button>
          <button className="calc-btn" onClick={() => handleNumPress('5')}>5</button>
          <button className="calc-btn" onClick={() => handleNumPress('6')}>6</button>
          <button className="calc-btn action-btn" onClick={handleToggleSign}>
            {calcSign === '+' ? '-' : '+'}
          </button>

          <button className="calc-btn" onClick={() => handleNumPress('1')}>1</button>
          <button className="calc-btn" onClick={() => handleNumPress('2')}>2</button>
          <button className="calc-btn" onClick={() => handleNumPress('3')}>3</button>
          <button className="calc-btn enter-btn" onClick={handleEnter}>OK</button>

          <button className="calc-btn" onClick={() => handleNumPress('0')}>0</button>
          <button className="calc-btn" onClick={() => handleNumPress('00')}>00</button>
          <button className="calc-btn" onClick={() => handleNumPress('000')}>000</button>
        </div>
      </div>

      {/* History Log panel */}
      <div className="duel-logs-panel">
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.5px' }}>
          LOG DE BATALHA DO DUELO
        </div>
        {duelLogs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '11px', padding: '16px 0' }}>
            Nenhum evento registrado ainda.
          </div>
        ) : (
          duelLogs.map((log) => (
            <div key={log.id} className={`log-item log-${log.type}`}>
              <span className="log-time">{log.timestamp}</span>
              <span>{log.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Editing Names Modal Overlay */}
      {isEditingNames && (
        <div className="standard-modal-overlay">
          <div className="standard-modal">
            <h3 style={{ color: 'var(--gold)', fontSize: '16px', fontWeight: '700' }}>Alterar Nomes dos Jogadores</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Nome do Duelista 1 (Gold)</label>
                <input
                  type="text"
                  className="textbox"
                  value={profile.name || 'Jogador Principal'}
                  disabled
                  style={{ width: '100%', marginTop: '4px', opacity: 0.5, cursor: 'not-allowed', background: 'rgba(0,0,0,0.2)' }}
                />
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', display: 'block' }}>Definido nas configurações do seu Perfil.</span>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Nome do Duelista 2 (Blue)</label>
                <input
                  type="text"
                  className="textbox"
                  value={tempP2Name}
                  onChange={(e) => setTempP2Name(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button className="btn-secondary" onClick={cancelNames} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <X size={14} /> Cancelar
              </button>
              <button className="btn-premium" onClick={saveNames} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coin Flip Modal Overlay */}
      {showCoin && (
        <div className="interactive-tool-modal">
          <h2 style={{ color: 'var(--gold)', marginBottom: '30px', fontSize: '20px', fontWeight: '700' }}>🪙 Lançamento de Moeda</h2>
          <div style={{ height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className={`coin-graphic ${isCoinFlipping ? 'flipping' : ''}`}>
              {isCoinFlipping ? '...' : coinResult === 'Heads' ? 'CARA' : coinResult === 'Tails' ? 'COROA' : 'Y-G-O'}
            </div>
          </div>
          <p style={{ margin: '20px 0', fontSize: '14px', color: '#a0a4b0', height: '24px', fontWeight: '600' }}>
            {isCoinFlipping ? 'Girando no ar...' : coinResult ? `Resultado: ${coinResult === 'Heads' ? 'CARA' : 'COROA'}` : 'Toque em Lançar'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-premium" onClick={triggerCoinFlip} disabled={isCoinFlipping}>
              Lançar Moeda
            </button>
            <button className="btn-secondary" onClick={() => { playBeep(); setShowCoin(false); setCoinResult(null); }} disabled={isCoinFlipping}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Dice Roll Modal Overlay */}
      {showDice && (
        <div className="interactive-tool-modal">
          <h2 style={{ color: 'var(--purple)', marginBottom: '30px', fontSize: '20px', fontWeight: '700' }}>🎲 Rolar Dado de Duelo</h2>
          <div style={{ height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className={`dice-graphic ${isDiceRolling ? 'rolling' : ''}`}>
              {isDiceRolling ? '?' : diceResult !== null ? diceResult : '🎲'}
            </div>
          </div>
          <p style={{ margin: '20px 0', fontSize: '14px', color: '#a0a4b0', height: '24px', fontWeight: '600' }}>
            {isDiceRolling ? 'Rolando o dado...' : diceResult !== null ? `Resultado: Nível ${diceResult}` : 'Toque em Rolar'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-premium" style={{ background: 'linear-gradient(135deg, var(--purple) 0%, #7a52c7 100%)', boxShadow: '0 4px 15px rgba(184, 107, 255, 0.3)' }} onClick={triggerDiceRoll} disabled={isDiceRolling}>
              Rolar Dado
            </button>
            <button className="btn-secondary" onClick={() => { playBeep(); setShowDice(false); setDiceResult(null); }} disabled={isDiceRolling}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Custom Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="standard-modal-overlay no-print">
          <div className="standard-modal" style={{ maxWidth: '320px' }}>
            <h3 style={{ color: 'var(--red)', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚠️ Confirmar Reinício
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4', margin: '8px 0 12px 0' }}>
              Tem certeza que deseja reiniciar os pontos de vida para 8000 e limpar todos os logs do duelo? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { playBeep(); setShowResetConfirm(false); }} style={{ fontSize: '11px', padding: '6px 12px' }}>
                Cancelar
              </button>
              <button
                className="btn-premium"
                onClick={() => {
                  playBeep();
                  resetDuel();
                  setShowResetConfirm(false);
                }}
                style={{
                  fontSize: '11px',
                  padding: '6px 12px',
                  background: 'linear-gradient(135deg, var(--red) 0%, #a31834 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(255, 56, 96, 0.2)'
                }}
              >
                Sim, Resetar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duel Outcome Modal Overlay */}
      {duelOutcome && (
        <div className="standard-modal-overlay no-print">
          <div 
            className="standard-modal premium-glow" 
            style={{ 
              maxWidth: '320px', 
              textAlign: 'center',
              border: duelOutcome === 'victory' ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255, 75, 75, 0.3)',
              boxShadow: duelOutcome === 'victory' ? '0 0 20px rgba(212, 175, 55, 0.15)' : '0 0 20px rgba(255, 75, 75, 0.15)',
              background: 'radial-gradient(circle at center, #151821 0%, #0b0c10 100%)'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              {duelOutcome === 'victory' ? '🏆' : '💀'}
            </div>
            <h3 style={{ 
              color: duelOutcome === 'victory' ? 'var(--gold)' : 'var(--red)', 
              fontSize: '18px', 
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 8px 0'
            }}>
              {duelOutcome === 'victory' ? 'Vitória!' : 'Derrota!'}
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              {duelOutcome === 'victory' 
                ? `Você venceu o duelo contra ${p2Name}!`
                : `Você foi derrotado por ${p2Name}!`}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="btn-premium"
                onClick={handleConfirmOutcome}
                style={{
                  fontSize: '12px',
                  padding: '10px 16px',
                  width: '100%',
                  background: duelOutcome === 'victory' 
                    ? 'linear-gradient(135deg, var(--gold) 0%, #b89020 100%)'
                    : 'linear-gradient(135deg, var(--red) 0%, #b31d38 100%)',
                  boxShadow: duelOutcome === 'victory'
                    ? '0 4px 15px rgba(212, 175, 55, 0.25)'
                    : '0 4px 15px rgba(255, 75, 75, 0.25)',
                  color: duelOutcome === 'victory' ? '#000' : '#fff',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Registrar Resultado e Reiniciar
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  playBeep();
                  undoLastAction();
                }}
                style={{ 
                  fontSize: '11px', 
                  padding: '8px 16px',
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer'
                }}
              >
                Desfazer Última Ação (Corrigir)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Deck Box Panel Overlay */}
      {showDeckPanel && favoriteDeck && (
        <div className="standard-modal-overlay no-print" style={{ zIndex: 9999 }}>
          <div 
            className="standard-modal premium-glow" 
            style={{ 
              maxWidth: '450px', 
              width: '95%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              background: 'radial-gradient(circle at center, #151821 0%, #0b0c10 100%)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              boxShadow: '0 0 24px rgba(212, 175, 55, 0.15)',
              borderRadius: '16px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📦</span>
                <div>
                  <h3 style={{ color: 'var(--gold)', fontSize: '15px', fontWeight: '900', margin: 0 }}>
                    {favoriteDeck.name}
                  </h3>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
                    Interação de Cartas em Duelo
                  </span>
                </div>
              </div>
              <button 
                onClick={() => { playBeep(); setShowDeckPanel(false); setSearchQuery(''); }}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                className="textbox"
                placeholder="🔍 Buscar carta no baralho..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', fontSize: '12px' }}
              />
            </div>

            {/* Tabs (Main Deck vs Extra Deck) */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => { playBeep(); setDeckPanelTab('main'); }}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  background: deckPanelTab === 'main' ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
                  color: deckPanelTab === 'main' ? '#000' : 'rgba(255,255,255,0.6)',
                  border: deckPanelTab === 'main' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Baralho Principal ({favoriteDeck.mainDeck.length})
              </button>
              {favoriteDeck.extraDeck && favoriteDeck.extraDeck.length > 0 && (
                <button
                  onClick={() => { playBeep(); setDeckPanelTab('extra'); }}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    background: deckPanelTab === 'extra' ? 'var(--blue)' : 'rgba(255,255,255,0.03)',
                    color: deckPanelTab === 'extra' ? '#000' : 'rgba(255,255,255,0.6)',
                    border: deckPanelTab === 'extra' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Deck Extra ({favoriteDeck.extraDeck.length})
                </button>
              )}
            </div>

            {/* Card List (Scrollable) */}
            <div 
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                paddingRight: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                minHeight: '200px'
              }}
            >
              {(() => {
                const currentDeckList = deckPanelTab === 'main' ? favoriteDeck.mainDeck : favoriteDeck.extraDeck;
                
                // Map to actual card objects
                const cardsWithIndex = currentDeckList.map((cardId, index) => {
                  const card = allCards.find(c => c.id === cardId);
                  return { card, cardId, index };
                });

                // Filter by search query
                const filtered = cardsWithIndex.filter(item => {
                  if (!searchQuery.trim()) return true;
                  return item.card?.name.toLowerCase().includes(searchQuery.toLowerCase());
                });

                if (filtered.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '30px 0', fontSize: '11px' }}>
                      Nenhuma carta encontrada.
                    </div>
                  );
                }

                return filtered.map(({ card, cardId, index }) => {
                  if (!card) return null;
                  
                  // Key for unique instance in deckCardStates
                  const key = `${favoriteDeck.id}-${cardId}-${index}`;
                  const state = deckCardStates[key] || { atkModifier: 0, defModifier: 0, counters: 0 };
                  const isMonster = card.type?.toLowerCase().includes('monster');
                  
                  const currentAtk = isMonster ? Math.max(0, (card.atk || 0) + state.atkModifier) : 0;
                  const currentDef = isMonster ? Math.max(0, (card.def || 0) + state.defModifier) : 0;

                  const hasChanges = state.atkModifier !== 0 || state.defModifier !== 0 || state.counters > 0;

                  return (
                    <div 
                      key={key}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: hasChanges ? '1px solid rgba(212,175,55,0.25)' : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: hasChanges ? '0 0 10px rgba(212,175,55,0.05)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {/* Card Info Header */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {card.card_images?.[0]?.image_url_small ? (
                          <img 
                            src={card.card_images[0].image_url_small} 
                            alt={card.name} 
                            style={{ width: '32px', height: '46px', borderRadius: '4px', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div style={{ width: '32px', height: '46px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            🃏
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                            <strong style={{ fontSize: '11px', color: '#fff', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {card.name}
                            </strong>
                            {hasChanges && (
                              <button
                                onClick={() => {
                                  playBeep();
                                  updateCardState(key, { atkModifier: 0, defModifier: 0, counters: 0 });
                                }}
                                style={{
                                  background: 'rgba(255,75,75,0.1)',
                                  border: '1px solid rgba(255,75,75,0.3)',
                                  color: 'var(--red)',
                                  fontSize: '8px',
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold'
                                }}
                                title="Resetar Modificações"
                              >
                                Limpar
                              </button>
                            )}
                          </div>
                          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
                            {card.type}
                          </span>
                        </div>
                      </div>

                      {/* Modifiers & Controls */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                        {/* ATK & DEF (Monsters Only) */}
                        {isMonster && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '130px' }}>
                            {/* ATK Row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                                ATK: <span style={{ color: state.atkModifier > 0 ? '#52c41a' : state.atkModifier < 0 ? '#ff4d4f' : '#fff' }}>{currentAtk}</span>
                              </span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={() => { playBeep(); updateCardState(key, { atkModifier: state.atkModifier - 100 }); }}
                                  style={{ padding: '1px 4px', fontSize: '9px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', cursor: 'pointer', width: '22px' }}
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => { playBeep(); updateCardState(key, { atkModifier: state.atkModifier + 100 }); }}
                                  style={{ padding: '1px 4px', fontSize: '9px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', cursor: 'pointer', width: '22px' }}
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => { playBeep(); updateCardState(key, { atkModifier: state.atkModifier + 500 }); }}
                                  style={{ padding: '1px 4px', fontSize: '8px', background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  +500
                                </button>
                              </div>
                            </div>

                            {/* DEF Row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                                DEF: <span style={{ color: state.defModifier > 0 ? '#52c41a' : state.defModifier < 0 ? '#ff4d4f' : '#fff' }}>{currentDef}</span>
                              </span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={() => { playBeep(); updateCardState(key, { defModifier: state.defModifier - 100 }); }}
                                  style={{ padding: '1px 4px', fontSize: '9px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', cursor: 'pointer', width: '22px' }}
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => { playBeep(); updateCardState(key, { defModifier: state.defModifier + 100 }); }}
                                  style={{ padding: '1px 4px', fontSize: '9px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', cursor: 'pointer', width: '22px' }}
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => { playBeep(); updateCardState(key, { defModifier: state.defModifier + 500 }); }}
                                  style={{ padding: '1px 4px', fontSize: '8px', background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  +500
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Counters (All Card Types) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '130px', justifyContent: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                              Marcadores: <span style={{ color: state.counters > 0 ? '#1890ff' : '#fff', fontWeight: '900' }}>{state.counters}</span>
                            </span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => { playBeep(); updateCardState(key, { counters: Math.max(0, state.counters - 1) }); }}
                                style={{ padding: '1px 6px', fontSize: '9px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', cursor: 'pointer' }}
                              >
                                -
                              </button>
                              <button
                                onClick={() => { playBeep(); updateCardState(key, { counters: state.counters + 1 }); }}
                                style={{ padding: '1px 6px', fontSize: '9px', background: 'rgba(24,144,255,0.1)', color: '#40a9ff', border: '1px solid rgba(24,144,255,0.3)', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Bottom Actions */}
            <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', display: 'flex', gap: '8px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => { playBeep(); setShowDeckPanel(false); setSearchQuery(''); }}
                style={{ flex: 1, padding: '8px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', color: '#fff' }}
              >
                Voltar ao Duelo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

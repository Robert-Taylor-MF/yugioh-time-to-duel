import React, { useState, useRef } from 'react';
import { useApp, type TournamentMatch } from '../context/AppContext';
import { Plus, Trophy, Trash2, RefreshCw, Award, Swords } from 'lucide-react';

export const TournamentsView: React.FC = () => {
  const {
    tournaments,
    createTournament,
    declareMatchWinner,
    resetTournament,
    deleteTournament
  } = useApp();

  // --- States & Refs ---
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentMode, setTournamentMode] = useState<'single' | 'podium'>('single');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [playersList, setPlayersList] = useState<string[]>([]);
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);

  // Drag Scroll state
  const bracketRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollTopVal, setScrollTopVal] = useState(0);
  const hasDraggedRef = useRef(false);

  // Custom Modal Dialogs States
  const [pendingWinnerConfirm, setPendingWinnerConfirm] = useState<{ roundNum: number; match: TournamentMatch; winnerName: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNewTourneyConfirm, setShowNewTourneyConfirm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // --- Handlers ---
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlayerName.trim();
    if (!name) return;
    if (playersList.some(p => p.toLowerCase() === name.toLowerCase())) {
      alert('Jogador já cadastrado!');
      return;
    }
    if (playersList.length >= 16) {
      alert('Limite máximo de 16 jogadores atingido!');
      return;
    }
    setPlayersList(prev => [...prev, name]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (index: number) => {
    setPlayersList(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartTournament = () => {
    if (playersList.length < 2) {
      alert('Cadastre pelo menos 2 jogadores para iniciar!');
      return;
    }
    const name = tournamentName.trim() || `Torneio de Duelos #${tournaments.length + 1}`;
    createTournament(name, playersList, tournamentMode);
    
    // Clear registration state
    setTournamentName('');
    setPlayersList([]);
    setIsCreating(false);
  };

  // Find active tournament
  const activeTournament = isCreating ? null : (tournaments.find(t => t.id === activeTournamentId) || tournaments[tournaments.length - 1]);

  const handleNodeClick = (roundNum: number, match: TournamentMatch, winnerName: string | null) => {
    if (hasDraggedRef.current) return;
    if (!winnerName || winnerName === 'BYE' || winnerName === 'Ninguém') return;
    setPendingWinnerConfirm({ roundNum, match, winnerName });
  };

  // --- Drag Scroll Handlers (Desktop & Mobile) ---
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!bracketRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    setStartX(clientX - bracketRef.current.offsetLeft);
    setScrollLeft(bracketRef.current.scrollLeft);

    const appContentEl = bracketRef.current.closest('.app-content') as HTMLElement;
    if (appContentEl) {
      setStartY(clientY);
      setScrollTopVal(appContentEl.scrollTop);
    }
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !bracketRef.current) return;
    
    // Scroll X (horizontal)
    const x = clientX - bracketRef.current.offsetLeft;
    const walkX = (x - startX) * 1.5;
    bracketRef.current.scrollLeft = scrollLeft - walkX;

    // Scroll Y (vertical)
    const appContentEl = bracketRef.current.closest('.app-content') as HTMLElement;
    if (appContentEl) {
      const walkY = (clientY - startY) * 1.5;
      appContentEl.scrollTop = scrollTopVal - walkY;
      
      if (Math.abs(walkX) > 5 || Math.abs(walkY) > 5) {
        hasDraggedRef.current = true;
      }
    } else {
      if (Math.abs(walkX) > 5) {
        hasDraggedRef.current = true;
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.pageX, e.pageY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleDragMove(e.pageX, e.pageY);
  };

  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => handleDragEnd();

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.pageX, touch.pageY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleDragMove(touch.pageX, touch.pageY);
  };

  const handleTouchEnd = () => handleDragEnd();

  const submitWinnerConfirm = () => {
    if (!pendingWinnerConfirm || !activeTournament) return;
    declareMatchWinner(
      activeTournament.id,
      pendingWinnerConfirm.roundNum,
      pendingWinnerConfirm.match.id,
      pendingWinnerConfirm.winnerName
    );
    setPendingWinnerConfirm(null);
  };

  // Auto focus active tournament if exists
  if (tournaments.length > 0 && !activeTournamentId) {
    setActiveTournamentId(tournaments[tournaments.length - 1].id);
  }

  // Render active tournament bracket
  if (activeTournament) {
    const isFinished = activeTournament.status === 'finished';
    
    return (
      <div className="tournament-view-container" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
        {/* Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {tournaments.length > 1 ? (
              <select
                className="textbox"
                value={activeTournament.id}
                onChange={(e) => setActiveTournamentId(e.target.value)}
                style={{ padding: '4px 8px', fontSize: '12px', height: '28px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontWeight: 'bold' }}
              >
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            ) : (
              <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: 0 }}>{activeTournament.name}</h2>
            )}
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Status: {isFinished ? '🏆 Finalizado' : '⚔️ Em Andamento'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="tool-btn" onClick={() => resetTournament(activeTournament.id)} title="Resetar Chaves" style={{ padding: '6px 10px', fontSize: '11px', height: '30px' }}>
              <RefreshCw size={12} /> Reiniciar
            </button>
            <button className="tool-btn" style={{ color: 'var(--red)', padding: '6px 10px', fontSize: '11px', height: '30px' }} onClick={() => setShowDeleteConfirm(true)} title="Excluir Torneio">
              <Trash2 size={12} /> Excluir
            </button>
          </div>
        </div>

        {/* Winner Champ Banner / Podium */}
        {isFinished && activeTournament.winner && (
          <div className="tournament-champ-banner" style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.12)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <h3 style={{ fontSize: '12px', fontWeight: '900', color: 'var(--gold)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              🏆 Pódio Final 🏆
            </h3>
            
            {activeTournament.mode === 'podium' ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '10px', marginTop: '6px' }}>
                {/* 2nd Place */}
                {activeTournament.secondPlace && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                    <span style={{ fontSize: '18px', marginBottom: '2px' }}>🥈</span>
                    <span style={{ fontSize: '9px', color: '#c0c0c0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>2º Lugar</span>
                    <div style={{
                      background: 'linear-gradient(180deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.02) 100%)',
                      border: '1px solid rgba(192, 192, 192, 0.2)',
                      borderBottom: 'none',
                      width: '100%',
                      height: '42px',
                      borderRadius: '6px 6px 0 0',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '2px'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '76px' }}>
                        {activeTournament.secondPlace}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* 1st Place */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90px', zIndex: 1 }}>
                  <span style={{ fontSize: '24px', marginBottom: '0px', filter: 'drop-shadow(0 2px 4px rgba(212,175,55,0.4))' }}>👑</span>
                  <span style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '2px' }}>Campeão</span>
                  <div style={{
                    background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.02) 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderBottom: 'none',
                    width: '100%',
                    height: '56px',
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2px',
                    boxShadow: '0 0 10px rgba(212, 175, 55, 0.1)'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '86px' }}>
                      {activeTournament.winner}
                    </span>
                  </div>
                </div>
                
                {/* 3rd Place */}
                {activeTournament.thirdPlaceWinner && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                    <span style={{ fontSize: '18px', marginBottom: '2px' }}>🥉</span>
                    <span style={{ fontSize: '9px', color: '#cd7f32', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>3º Lugar</span>
                    <div style={{
                      background: 'linear-gradient(180deg, rgba(205, 127, 50, 0.15) 0%, rgba(205, 127, 50, 0.02) 100%)',
                      border: '1px solid rgba(205, 127, 50, 0.2)',
                      borderBottom: 'none',
                      width: '100%',
                      height: '32px',
                      borderRadius: '6px 6px 0 0',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '2px'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '76px' }}>
                        {activeTournament.thirdPlaceWinner}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '4px' }}>
                <Award size={20} style={{ color: 'var(--gold)' }} />
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '800' }}>Vencedor</span>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>{activeTournament.winner}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Guide message */}
        {!isFinished && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
              ⚔️ Toque no duelista vencedor para avançá-lo na chave do torneio.
            </span>
          </div>
        )}

        {/* Horizontal Scroll Bracket Tree (Beautiful dynamic sizing with tree connectors) */}
        <div 
          ref={bracketRef}
          className="bracket-container" 
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            display: 'flex', 
            gap: '30px', 
            overflowX: 'auto', 
            padding: '20px 10px', 
            alignItems: 'stretch',
            minHeight: '320px',
            background: 'rgba(0,0,0,0.15)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.03)',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
        >
          {activeTournament.rounds.map((round) => (
            <div 
              key={round.roundNumber} 
              className="bracket-round" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-around', 
                minWidth: '160px',
                height: '100%' 
              }}
            >
              <div 
                className="round-title" 
                style={{ 
                  textAlign: 'center', 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  color: 'var(--gold)', 
                  borderBottom: '2px solid rgba(212,175,55,0.2)', 
                  paddingBottom: '4px',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {round.roundNumber === activeTournament.rounds.length ? 'Final' : `Rodada ${round.roundNumber}`}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: '20px' }}>
                {(() => {
                  // Group matches into pairs
                  const pairs: TournamentMatch[][] = [];
                  for (let i = 0; i < round.matches.length; i += 2) {
                    pairs.push(round.matches.slice(i, i + 2));
                  }

                  return pairs.map((pair, pIdx) => (
                    <div 
                      key={pIdx}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '20px', 
                        position: 'relative',
                        paddingRight: round.roundNumber < activeTournament.rounds.length ? '30px' : '0'
                      }}
                    >
                      {pair.map((match, mIdxInPair) => {
                        const p1Winner = match.winner === match.player1 && match.player1 !== null;
                        const p2Winner = match.winner === match.player2 && match.player2 !== null;
                        
                        const p1Loser = match.winner !== null && match.winner !== match.player1;
                        const p2Loser = match.winner !== null && match.winner !== match.player2;

                        return (
                          <div 
                            key={match.id} 
                            className="bracket-match" 
                            style={{ 
                              background: 'rgba(20, 24, 35, 0.9)', 
                              border: '1px solid rgba(255,255,255,0.06)', 
                              borderRadius: '8px', 
                              overflow: 'hidden',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                              display: 'flex',
                              flexDirection: 'column',
                              width: '100%',
                              position: 'relative',
                              zIndex: 2
                            }}
                          >
                            {/* Match Number tag */}
                            <div style={{ 
                              fontSize: '8px', 
                              background: 'rgba(255,255,255,0.02)', 
                              color: 'rgba(255,255,255,0.3)', 
                              padding: '2px 8px', 
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontWeight: 'bold'
                            }}>
                              <span>CONFRONTO #{((pIdx * 2) + mIdxInPair) + 1}</span>
                              <Swords size={8} style={{ opacity: 0.5 }} />
                            </div>

                            {/* Player 1 Node */}
                            <div
                              className={`match-player-node ${p1Winner ? 'winner' : ''} ${p1Loser ? 'loser' : ''} ${!match.player1 ? 'empty' : ''}`}
                              onClick={() => handleNodeClick(round.roundNumber, match, match.player1)}
                              style={{
                                padding: '8px 12px',
                                fontSize: '11px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                cursor: match.player1 ? 'pointer' : 'default',
                                transition: 'background 0.2s',
                                color: p1Winner ? 'var(--gold)' : p1Loser ? 'rgba(255,255,255,0.25)' : '#fff'
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
                                {match.player1 || 'Aguardando...'}
                              </span>
                              {p1Winner && <span style={{ fontSize: '10px' }}>👑</span>}
                            </div>

                            {/* Player 2 Node */}
                            <div
                              className={`match-player-node ${p2Winner ? 'winner' : ''} ${p2Loser ? 'loser' : ''} ${!match.player2 ? 'empty' : ''}`}
                              onClick={() => handleNodeClick(round.roundNumber, match, match.player2)}
                              style={{
                                padding: '8px 12px',
                                fontSize: '11px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: match.player2 ? 'pointer' : 'default',
                                transition: 'background 0.2s',
                                color: p2Winner ? 'var(--gold)' : p2Loser ? 'rgba(255,255,255,0.25)' : '#fff'
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
                                {match.player2 || 'Aguardando...'}
                              </span>
                              {p2Winner && <span style={{ fontSize: '10px' }}>👑</span>}
                            </div>
                          </div>
                        );
                      })}

                      {/* Tree Bracket Connector Lines */}
                      {round.roundNumber < activeTournament.rounds.length && pair.length === 2 && (
                        <div style={{
                          position: 'absolute',
                          right: '15px',
                          top: '25%',
                          bottom: '25%',
                          width: '15px',
                          border: '2px solid rgba(212,175,55,0.25)',
                          borderLeft: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}>
                          <div style={{ width: '15px', height: '2px', background: 'rgba(212,175,55,0.25)' }} />
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* Third Place Match Section */}
        {activeTournament.mode === 'podium' && activeTournament.thirdPlaceMatch && (
          <div className="glass-panel" style={{ padding: '10px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--gold)', borderBottom: '1px solid rgba(212,175,55,0.12)', paddingBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', justifyContent: 'space-between' }}>
              <span>🥉 Disputa de 3º Lugar</span>
              {activeTournament.thirdPlaceWinner && <span style={{ color: '#cd7f32' }}>Decidido</span>}
            </div>
            
            <div 
              className="bracket-match" 
              style={{ 
                background: 'rgba(20, 24, 35, 0.9)', 
                border: '1px solid rgba(255,255,255,0.06)', 
                borderRadius: '8px', 
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                position: 'relative'
              }}
            >
              {/* Player 1 Node */}
              <div
                className={`match-player-node ${activeTournament.thirdPlaceWinner === activeTournament.thirdPlaceMatch.player1 ? 'winner' : ''} ${activeTournament.thirdPlaceWinner && activeTournament.thirdPlaceWinner !== activeTournament.thirdPlaceMatch.player1 ? 'loser' : ''}`}
                onClick={() => handleNodeClick(99, activeTournament.thirdPlaceMatch!, activeTournament.thirdPlaceMatch!.player1)}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '6px',
                  flex: 1,
                  borderRight: '1px solid rgba(255,255,255,0.03)',
                  cursor: activeTournament.thirdPlaceMatch.player1 ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                  color: activeTournament.thirdPlaceWinner === activeTournament.thirdPlaceMatch.player1 ? 'var(--gold)' : activeTournament.thirdPlaceWinner ? 'rgba(255,255,255,0.25)' : '#fff',
                  background: activeTournament.thirdPlaceWinner === activeTournament.thirdPlaceMatch.player1 ? 'rgba(212,175,55,0.05)' : 'transparent'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                  {activeTournament.thirdPlaceMatch.player1 || 'Aguardando...'}
                </span>
                {activeTournament.thirdPlaceWinner === activeTournament.thirdPlaceMatch.player1 && <span style={{ fontSize: '9px' }}>🥉</span>}
              </div>

              {/* VS separator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontWeight: 'bold', background: 'rgba(0,0,0,0.2)' }}>
                VS
              </div>

              {/* Player 2 Node */}
              <div
                className={`match-player-node ${activeTournament.thirdPlaceWinner === activeTournament.thirdPlaceMatch.player2 ? 'winner' : ''} ${activeTournament.thirdPlaceWinner && activeTournament.thirdPlaceWinner !== activeTournament.thirdPlaceMatch.player2 ? 'loser' : ''}`}
                onClick={() => handleNodeClick(99, activeTournament.thirdPlaceMatch!, activeTournament.thirdPlaceMatch!.player2)}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '6px',
                  flex: 1,
                  cursor: activeTournament.thirdPlaceMatch.player2 ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                  color: activeTournament.thirdPlaceWinner === activeTournament.thirdPlaceMatch.player2 ? 'var(--gold)' : activeTournament.thirdPlaceWinner ? 'rgba(255,255,255,0.25)' : '#fff',
                  background: activeTournament.thirdPlaceWinner === activeTournament.thirdPlaceMatch.player2 ? 'rgba(212,175,55,0.05)' : 'transparent'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                  {activeTournament.thirdPlaceMatch.player2 || 'Aguardando...'}
                </span>
                {activeTournament.thirdPlaceWinner === activeTournament.thirdPlaceMatch.player2 && <span style={{ fontSize: '9px' }}>🥉</span>}
              </div>
            </div>
          </div>
        )}

        {activeTournament.mode === 'podium' && !activeTournament.thirdPlaceMatch && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', padding: '6px 4px', fontStyle: 'italic', textAlign: 'center' }}>
            * A disputa do 3º lugar será liberada quando a rodada de semifinais terminar.
          </div>
        )}

        {/* Back to Setup Option */}
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button className="btn-secondary" onClick={() => setShowNewTourneyConfirm(true)} style={{ fontSize: '11px', padding: '6px 12px' }}>
            + Novo Torneio
          </button>
        </div>

        {/* Custom Winner Confirm Modal */}
        {pendingWinnerConfirm && (
          <div className="standard-modal-overlay no-print">
            <div className="standard-modal" style={{ maxWidth: '320px' }}>
              <h3 style={{ color: 'var(--gold)', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚔️ Declarar Vencedor
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4', margin: '8px 0 12px 0' }}>
                {pendingWinnerConfirm.match.winner ? (
                  <>Esta partida já possui o vencedor <strong>"{pendingWinnerConfirm.match.winner}"</strong>. Deseja alterar para <strong>"{pendingWinnerConfirm.winnerName}"</strong>?</>
                ) : (
                  <>Confirmar a vitória de <strong>"{pendingWinnerConfirm.winnerName}"</strong> nesta rodada?</>
                )}
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setPendingWinnerConfirm(null)} style={{ fontSize: '11px', padding: '6px 12px' }}>
                  Cancelar
                </button>
                <button className="btn-premium" onClick={submitWinnerConfirm} style={{ fontSize: '11px', padding: '6px 12px' }}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Delete Tourney Confirm Modal */}
        {showDeleteConfirm && (
          <div className="standard-modal-overlay no-print">
            <div className="standard-modal" style={{ maxWidth: '320px' }}>
              <h3 style={{ color: 'var(--red)', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚠️ Excluir Torneio
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4', margin: '8px 0 12px 0' }}>
                Tem certeza que deseja excluir permanentemente o torneio <strong>"{activeTournament.name}"</strong>? Todo o histórico de confrontos será apagado.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)} style={{ fontSize: '11px', padding: '6px 12px' }}>
                  Cancelar
                </button>
                <button
                  className="btn-premium"
                  onClick={() => {
                    deleteTournament(activeTournament.id);
                    setActiveTournamentId(null);
                    setShowDeleteConfirm(false);
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

        {/* Custom New Tourney Confirm Modal */}
        {showNewTourneyConfirm && (
          <div className="standard-modal-overlay no-print">
            <div className="standard-modal" style={{ maxWidth: '320px' }}>
              <h3 style={{ color: 'var(--gold)', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🏆 Novo Torneio
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4', margin: '8px 0 12px 0' }}>
                Deseja abandonar este torneio ativo e voltar para a tela de cadastro para criar uma nova chave?
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setShowNewTourneyConfirm(false)} style={{ fontSize: '11px', padding: '6px 12px' }}>
                  Não, Continuar
                </button>
                <button
                  className="btn-premium"
                  onClick={() => {
                    setIsCreating(true);
                    setActiveTournamentId(null);
                    setShowNewTourneyConfirm(false);
                  }}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  Sim, Criar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Setup Mode (Cadastro de Torneio)
  return (
    <div className="tournament-view-container" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={20} style={{ color: 'var(--gold)' }} /> Módulo de Torneios
        </h2>
        {tournaments.length > 0 && (
          <button className="tool-btn" onClick={() => setIsCreating(false)} style={{ fontSize: '11px' }}>
            Ver Ativo
          </button>
        )}
      </div>

      <div className="glass-panel players-setup-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--gold)', margin: 0 }}>
          Configurar Nova Chave
        </h3>

        {/* Tournament Name Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>NOME DO TORNEIO (OPCIONAL):</label>
          <input
            type="text"
            className="textbox"
            placeholder="Ex: Torneio da Loja do yugi"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
          />
        </div>

        {/* Tournament Mode Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>MODO DE CLASSIFICAÇÃO:</label>
          <select
            className="textbox"
            value={tournamentMode}
            onChange={(e) => setTournamentMode(e.target.value as 'single' | 'podium')}
            style={{ padding: '8px 12px', fontSize: '12px' }}
          >
            <option value="single">Apenas Campeão (1º Lugar)</option>
            <option value="podium">Pódio Completo (1º, 2º e 3º Lugares)</option>
          </select>
        </div>

        {/* Player Name Input */}
        <form onSubmit={handleAddPlayer} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>ADICIONAR JOGADOR:</label>
          <div className="input-row">
            <input
              type="text"
              className="textbox"
              placeholder="Digite o nome do jogador..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
            />
            <button className="qty-btn" type="submit" style={{ borderRadius: '8px', width: '38px', height: '38px' }}>
              <Plus size={16} />
            </button>
          </div>
        </form>

        {/* Registered Players List */}
        <div>
          <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            JOGADORES CADASTRADOS ({playersList.length} / 16):
          </label>
          {playersList.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', padding: '12px 0', textAlign: 'center' }}>
              Nenhum jogador cadastrado para o chaveamento.
            </div>
          ) : (
            <div className="registered-players-list" style={{ maxHeight: '110px', overflowY: 'auto' }}>
              {playersList.map((player, idx) => (
                <div key={idx} className="player-chip">
                  <span>{player}</span>
                  <button type="button" onClick={() => handleRemovePlayer(idx)}>&times;</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Start button */}
        <button
          className="btn-premium"
          onClick={handleStartTournament}
          disabled={playersList.length < 2}
          style={{ 
            marginTop: '8px', 
            padding: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            fontSize: '13px'
          }}
        >
          <Trophy size={16} /> Gerar Chaveamento do Torneio
        </button>
      </div>
    </div>
  );
};

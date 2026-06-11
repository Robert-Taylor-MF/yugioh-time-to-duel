import React, { useState } from 'react';
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

  // --- States ---
  const [tournamentName, setTournamentName] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [playersList, setPlayersList] = useState<string[]>([]);
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);

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
    createTournament(name, playersList);
    
    // Clear registration state
    setTournamentName('');
    setPlayersList([]);
    setIsCreating(false);
  };

  // Find active tournament
  const activeTournament = isCreating ? null : (tournaments.find(t => t.id === activeTournamentId) || tournaments[tournaments.length - 1]);

  const handleNodeClick = (roundNum: number, match: TournamentMatch, winnerName: string | null) => {
    if (!winnerName || winnerName === 'BYE' || winnerName === 'Ninguém') return;
    setPendingWinnerConfirm({ roundNum, match, winnerName });
  };

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
      <div className="tournament-view-container" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
        {/* Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{activeTournament.name}</h2>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Status: {isFinished ? 'Finalizado' : 'Em Andamento'}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="tool-btn" onClick={() => resetTournament(activeTournament.id)} title="Resetar Chaves">
              <RefreshCw size={14} /> Reiniciar
            </button>
            <button className="tool-btn" style={{ color: 'var(--red)' }} onClick={() => setShowDeleteConfirm(true)} title="Excluir Torneio">
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        </div>

        {/* Switch Torneio Dropdown */}
        {tournaments.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Ver outro torneio:</span>
            <select
              className="textbox"
              value={activeTournament.id}
              onChange={(e) => setActiveTournamentId(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.createdAt})</option>
              ))}
            </select>
          </div>
        )}

        {/* Winner Champ Banner */}
        {isFinished && activeTournament.winner && (
          <div className="tournament-champ-banner">
            <Award size={32} style={{ color: 'var(--gold)', margin: '0 auto 8px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--gold)' }}>🏆 CAMPEÃO 🏆</h3>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginTop: '4px' }}>
              {activeTournament.winner}
            </p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
              Parabéns ao vencedor do torneio de duelos!
            </p>
          </div>
        )}

        {/* Guide message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
            ⚔️ Toque no duelista vencedor para avançá-lo na chave do torneio.
          </span>
        </div>

        {/* Horizontal Scroll Bracket Tree (Beautiful dynamic sizing with tree connectors) */}
        <div 
          className="bracket-container" 
          style={{ 
            display: 'flex', 
            gap: '30px', 
            overflowX: 'auto', 
            padding: '20px 10px', 
            alignItems: 'stretch',
            minHeight: '440px',
            background: 'rgba(0,0,0,0.15)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.03)'
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

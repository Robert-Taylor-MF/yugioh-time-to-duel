import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Card } from '../data/defaultCards';
import { loadCardsFromDb } from '../services/cardDb';
import { fetchAndCacheCards } from '../services/ygoApi';

// --- Interfaces ---
export interface DuelLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'lp' | 'coin' | 'dice' | 'system';
  undoState?: {
    p1Lp: number;
    p2Lp: number;
  };
}

export interface CollectionCard {
  cardId: string;
  quantity: number; // Tenho (Owned quantity)
  wanted: number;   // Quero (Wanted quantity)
}

export interface CustomAlbum {
  id: string;
  name: string;
  description: string;
  cardIds: string[];
  createdAt: string;
}

export interface DeckCombo {
  id: string;
  name: string;
  cardIds: string[];
  steps: string;
}

export interface Deck {
  id: string;
  name: string;
  mainDeck: string[]; // array of card IDs
  extraDeck: string[]; // array of card IDs
  sideDeck: string[]; // array of card IDs
  createdAt: string;
  combos?: DeckCombo[];
  strategies?: string;
}

export interface TournamentMatch {
  id: string;
  player1: string | null;
  player2: string | null;
  winner: string | null;
}

export interface TournamentRound {
  roundNumber: number;
  matches: TournamentMatch[];
}

export interface Tournament {
  id: string;
  name: string;
  players: string[];
  rounds: TournamentRound[];
  status: 'setup' | 'active' | 'finished';
  winner: string | null;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  nickname: string;
  avatarUrl: string;
  wins: number;
  losses: number;
  isPremium: boolean;
}

interface AppContextType {
  // LP Counter
  p1Lp: number;
  p2Lp: number;
  p1Name: string;
  p2Name: string;
  duelLogs: DuelLog[];
  modifyLp: (player: 1 | 2, amount: number, customMessage?: string) => void;
  undoLastAction: () => void;
  resetDuel: () => void;
  rollDice: () => number;
  flipCoin: () => 'Heads' | 'Tails';
  updatePlayerNames: (p1: string, p2: string) => void;

  // Collection / Album
  collection: CollectionCard[];
  addToCollection: (cardId: string, targetType: 'owned' | 'wanted', qty?: number) => void;
  removeFromCollection: (cardId: string, targetType: 'owned' | 'wanted', qty?: number) => void;

  // Custom Albums
  customAlbums: CustomAlbum[];
  createCustomAlbum: (name: string, description?: string) => void;
  deleteCustomAlbum: (albumId: string) => void;
  addCardToCustomAlbum: (albumId: string, cardId: string) => void;
  removeCardFromCustomAlbum: (albumId: string, cardId: string) => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (cardId: string) => void;
  isFavorite: (cardId: string) => boolean;

  // Decks
  decks: Deck[];
  createDeck: (name: string) => Deck;
  deleteDeck: (deckId: string) => void;
  updateDeck: (deckId: string, mainDeck: string[], extraDeck: string[], sideDeck: string[], combos?: DeckCombo[], strategies?: string) => void;
  renameDeck: (deckId: string, newName: string) => void;

  // Tournaments
  tournaments: Tournament[];
  createTournament: (name: string, players: string[]) => void;
  declareMatchWinner: (tournamentId: string, roundNumber: number, matchId: string, winnerName: string) => void;
  resetTournament: (tournamentId: string) => void;
  deleteTournament: (tournamentId: string) => void;

  // Profile
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  togglePremium: () => void;

  // API Cards Database
  allCards: Card[];
  loadingCards: boolean;
  loadingError: string | null;
  updateCardsDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Helpers ---
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`yugioh_duel_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  // --- States ---
  const [p1Lp, setP1Lp] = useState<number>(() => getStored('p1Lp', 8000));
  const [p2Lp, setP2Lp] = useState<number>(() => getStored('p2Lp', 8000));
  const [p1Name, setP1Name] = useState<string>(() => getStored('p1Name', 'Duelista 1'));
  const [p2Name, setP2Name] = useState<string>(() => getStored('p2Name', 'Duelista 2'));
  const [duelLogs, setDuelLogs] = useState<DuelLog[]>(() => getStored('duelLogs', []));

  const [collection, setCollection] = useState<CollectionCard[]>(() => getStored('collection', []));
  const [customAlbums, setCustomAlbums] = useState<CustomAlbum[]>(() => getStored('customAlbums', []));
  const [favorites, setFavorites] = useState<string[]>(() => getStored('favorites', []));

  const [decks, setDecks] = useState<Deck[]>(() => getStored('decks', []));
  const [tournaments, setTournaments] = useState<Tournament[]>(() => getStored('tournaments', []));

  const [profile, setProfile] = useState<UserProfile>(() => getStored('profile', {
    name: 'Yugi Muto',
    nickname: 'Rei dos Jogos',
    avatarUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150',
    wins: 15,
    losses: 3,
    isPremium: true // Sempre Lendário / Acesso Total
  }));

  // API Cards states
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [loadingCards, setLoadingCards] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // --- Persist to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('yugioh_duel_p1Lp', JSON.stringify(p1Lp));
    localStorage.setItem('yugioh_duel_p2Lp', JSON.stringify(p2Lp));
    localStorage.setItem('yugioh_duel_p1Name', JSON.stringify(p1Name));
    localStorage.setItem('yugioh_duel_p2Name', JSON.stringify(p2Name));
    localStorage.setItem('yugioh_duel_duelLogs', JSON.stringify(duelLogs));
  }, [p1Lp, p2Lp, p1Name, p2Name, duelLogs]);

  useEffect(() => {
    localStorage.setItem('yugioh_duel_collection', JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    localStorage.setItem('yugioh_duel_customAlbums', JSON.stringify(customAlbums));
  }, [customAlbums]);

  useEffect(() => {
    localStorage.setItem('yugioh_duel_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('yugioh_duel_decks', JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem('yugioh_duel_tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem('yugioh_duel_profile', JSON.stringify(profile));
  }, [profile]);

  // --- API Cards Sync ---
  const updateCardsDatabase = async () => {
    setLoadingCards(true);
    setLoadingError(null);
    try {
      const cards = await fetchAndCacheCards();
      setAllCards(cards);
    } catch (err: any) {
      setLoadingError(err.message || 'Erro ao carregar dados da API.');
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    const initCards = async () => {
      try {
        const cached = await loadCardsFromDb();
        if (cached && cached.length > 0) {
          setAllCards(cached);
          setLoadingCards(false);
        } else {
          await updateCardsDatabase();
        }
      } catch (err) {
        console.error('IndexedDB load failed, trying api...', err);
        await updateCardsDatabase();
      }
    };
    initCards();
  }, []);

  // --- LP Functions ---
  const modifyLp = (player: 1 | 2, amount: number, customMessage?: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const currentP1 = p1Lp;
    const currentP2 = p2Lp;
    const targetName = player === 1 ? p1Name : p2Name;

    if (player === 1) {
      const nextLp = Math.max(0, p1Lp + amount);
      setP1Lp(nextLp);
      const logMessage = customMessage || `${targetName}: ${p1Lp} -> ${nextLp} (${amount >= 0 ? '+' : ''}${amount})`;
      setDuelLogs(prev => [
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp,
          message: logMessage,
          type: 'lp',
          undoState: { p1Lp: currentP1, p2Lp: currentP2 }
        },
        ...prev
      ]);
    } else {
      const nextLp = Math.max(0, p2Lp + amount);
      setP2Lp(nextLp);
      const logMessage = customMessage || `${targetName}: ${p2Lp} -> ${nextLp} (${amount >= 0 ? '+' : ''}${amount})`;
      setDuelLogs(prev => [
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp,
          message: logMessage,
          type: 'lp',
          undoState: { p1Lp: currentP1, p2Lp: currentP2 }
        },
        ...prev
      ]);
    }
  };

  const undoLastAction = () => {
    const actionToUndo = duelLogs.find(log => log.undoState);
    if (!actionToUndo || !actionToUndo.undoState) return;

    setP1Lp(actionToUndo.undoState.p1Lp);
    setP2Lp(actionToUndo.undoState.p2Lp);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setDuelLogs(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp,
        message: `Desfeito: LP restaurado para P1: ${actionToUndo.undoState!.p1Lp} | P2: ${actionToUndo.undoState!.p2Lp}`,
        type: 'system'
      },
      ...prev.filter(log => log.id !== actionToUndo.id)
    ]);
  };

  const resetDuel = () => {
    setP1Lp(8000);
    setP2Lp(8000);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setDuelLogs([
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp,
        message: 'Duelo reiniciado! LP resetado para 8000.',
        type: 'system'
      }
    ]);
  };

  const rollDice = (): number => {
    const result = Math.floor(Math.random() * 6) + 1;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setDuelLogs(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp,
        message: `Rolagem de Dado: Resultado = 🎲 ${result}`,
        type: 'dice'
      },
      ...prev
    ]);
    return result;
  };

  const flipCoin = (): 'Heads' | 'Tails' => {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const resultText = result === 'Heads' ? 'CARA' : 'COROA';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setDuelLogs(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp,
        message: `Lançamento de Moeda: Resultado = 🪙 ${resultText}`,
        type: 'coin'
      },
      ...prev
    ]);
    return result;
  };

  const updatePlayerNames = (p1: string, p2: string) => {
    setP1Name(p1 || 'Duelista 1');
    setP2Name(p2 || 'Duelista 2');
  };

  // --- Collection Functions ---
  const addToCollection = (cardId: string, targetType: 'owned' | 'wanted', qty = 1) => {
    setCollection(prev => {
      const existing = prev.find(item => item.cardId === cardId);
      if (existing) {
        return prev.map(item => {
          if (item.cardId === cardId) {
            return {
              ...item,
              quantity: targetType === 'owned' ? item.quantity + qty : item.quantity,
              wanted: targetType === 'wanted' ? (item.wanted || 0) + qty : (item.wanted || 0)
            };
          }
          return item;
        });
      }
      return [
        ...prev,
        {
          cardId,
          quantity: targetType === 'owned' ? qty : 0,
          wanted: targetType === 'wanted' ? qty : 0
        }
      ];
    });
  };

  const removeFromCollection = (cardId: string, targetType: 'owned' | 'wanted', qty = 1) => {
    setCollection(prev => {
      const existing = prev.find(item => item.cardId === cardId);
      if (!existing) return prev;

      const updated = prev.map(item => {
        if (item.cardId === cardId) {
          return {
            ...item,
            quantity: targetType === 'owned' ? Math.max(0, item.quantity - qty) : item.quantity,
            wanted: targetType === 'wanted' ? Math.max(0, (item.wanted || 0) - qty) : (item.wanted || 0)
          };
        }
        return item;
      });

      return updated.filter(item => item.quantity > 0 || (item.wanted && item.wanted > 0));
    });
  };

  // --- Custom Albums Functions ---
  const createCustomAlbum = (name: string, description = '') => {
    const newAlbum: CustomAlbum = {
      id: `album_${Date.now()}`,
      name: name || `Álbum Personalizado #${customAlbums.length + 1}`,
      description,
      cardIds: [],
      createdAt: new Date().toLocaleDateString()
    };
    setCustomAlbums(prev => [...prev, newAlbum]);
  };

  const deleteCustomAlbum = (albumId: string) => {
    setCustomAlbums(prev => prev.filter(a => a.id !== albumId));
  };

  const addCardToCustomAlbum = (albumId: string, cardId: string) => {
    setCustomAlbums(prev => prev.map(a => {
      if (a.id === albumId) {
        if (a.cardIds.includes(cardId)) return a;
        return { ...a, cardIds: [...a.cardIds, cardId] };
      }
      return a;
    }));
  };

  const removeCardFromCustomAlbum = (albumId: string, cardId: string) => {
    setCustomAlbums(prev => prev.map(a => {
      if (a.id === albumId) {
        return { ...a, cardIds: a.cardIds.filter(id => id !== cardId) };
      }
      return a;
    }));
  };

  // --- Favorites Functions ---
  const toggleFavorite = (cardId: string) => {
    setFavorites(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      }
      return [...prev, cardId];
    });
  };

  const isFavorite = (cardId: string): boolean => {
    return favorites.includes(cardId);
  };

  // --- Decks Functions ---
  const createDeck = (name: string): Deck => {
    const newDeck: Deck = {
      id: `deck_${Date.now()}`,
      name: name || `Novo Deck ${decks.length + 1}`,
      mainDeck: [],
      extraDeck: [],
      sideDeck: [],
      createdAt: new Date().toLocaleDateString(),
      combos: [],
      strategies: ''
    };
    setDecks(prev => [...prev, newDeck]);
    return newDeck;
  };

  const deleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(d => d.id !== deckId));
  };

  const updateDeck = (
    deckId: string, 
    mainDeck: string[], 
    extraDeck: string[], 
    sideDeck: string[],
    combos?: DeckCombo[],
    strategies?: string
  ) => {
    setDecks(prev => prev.map(d =>
      d.id === deckId ? { 
        ...d, 
        mainDeck, 
        extraDeck, 
        sideDeck,
        combos: combos !== undefined ? combos : d.combos,
        strategies: strategies !== undefined ? strategies : d.strategies
      } : d
    ));
  };

  const renameDeck = (deckId: string, newName: string) => {
    setDecks(prev => prev.map(d =>
      d.id === deckId ? { ...d, name: newName || 'Sem Nome' } : d
    ));
  };

  // --- Tournaments Functions ---
  const createTournament = (name: string, players: string[]) => {
    const count = players.length;
    let size = 4;
    if (count > 8) size = 16;
    else if (count > 4) size = 8;

    const paddedPlayers = [...players];
    while (paddedPlayers.length < size) {
      paddedPlayers.push('BYE');
    }

    const shuffled = [...paddedPlayers].sort(() => Math.random() - 0.5);

    const rounds: TournamentRound[] = [];
    let numMatchesInRound = size / 2;
    let currentRound = 1;

    while (numMatchesInRound >= 1) {
      const matches: TournamentMatch[] = [];
      for (let i = 0; i < numMatchesInRound; i++) {
        let p1: string | null = null;
        let p2: string | null = null;

        if (currentRound === 1) {
          p1 = shuffled[2 * i];
          p2 = shuffled[2 * i + 1];
        }

        matches.push({
          id: `t_m_${currentRound}_${i}`,
          player1: p1,
          player2: p2,
          winner: null
        });
      }

      rounds.push({
        roundNumber: currentRound,
        matches
      });

      numMatchesInRound /= 2;
      currentRound++;
    }

    // Auto-advance BYE matches in Round 1
    const round1 = rounds[0];
    const nextRound = rounds[1];

    round1.matches.forEach((match, idx) => {
      if (match.player1 === 'BYE' && match.player2 === 'BYE') {
        match.winner = 'Ninguém';
      } else if (match.player1 === 'BYE') {
        match.winner = match.player2;
      } else if (match.player2 === 'BYE') {
        match.winner = match.player1;
      }

      if (match.winner && match.winner !== 'Ninguém' && nextRound) {
        const nextMatchIdx = Math.floor(idx / 2);
        const nextPlayerKey = idx % 2 === 0 ? 'player1' : 'player2';
        nextRound.matches[nextMatchIdx][nextPlayerKey] = match.winner;
      }
    });

    const newTournament: Tournament = {
      id: `tour_${Date.now()}`,
      name: name || `Torneio de Duelos #${tournaments.length + 1}`,
      players: players.filter(p => p.trim() !== ''),
      rounds,
      status: 'active',
      winner: null,
      createdAt: new Date().toLocaleDateString()
    };

    setTournaments(prev => [...prev, newTournament]);
  };

  const declareMatchWinner = (tournamentId: string, roundNumber: number, matchId: string, winnerName: string) => {
    setTournaments(prev => prev.map(t => {
      if (t.id !== tournamentId) return t;

      const updatedRounds = t.rounds.map(round => {
        if (round.roundNumber !== roundNumber) return round;

        return {
          ...round,
          matches: round.matches.map(m =>
            m.id === matchId ? { ...m, winner: winnerName } : m
          )
        };
      });

      const totalRounds = t.rounds.length;
      let tournamentWinner: string | null = null;
      let status = t.status;

      if (roundNumber === totalRounds) {
        tournamentWinner = winnerName;
        status = 'finished';

        if (winnerName.toLowerCase() === profile.name.toLowerCase() || winnerName.toLowerCase() === profile.nickname.toLowerCase()) {
          setProfile(p => ({ ...p, wins: p.wins + 1 }));
        }
      } else {
        const nextRoundNum = roundNumber + 1;
        const currentMatchIdx = t.rounds[roundNumber - 1].matches.findIndex(m => m.id === matchId);
        const nextMatchIdx = Math.floor(currentMatchIdx / 2);
        const nextPlayerKey = currentMatchIdx % 2 === 0 ? 'player1' : 'player2';

        const nextRound = updatedRounds.find(r => r.roundNumber === nextRoundNum);
        if (nextRound && nextRound.matches[nextMatchIdx]) {
          nextRound.matches[nextMatchIdx][nextPlayerKey] = winnerName;

          const targetMatch = nextRound.matches[nextMatchIdx];
          if (targetMatch.player1 === 'BYE' || targetMatch.player2 === 'BYE') {
            const nextWinner = targetMatch.player1 === 'BYE' ? targetMatch.player2 : targetMatch.player1;
            if (nextWinner) {
              setTimeout(() => {
                declareMatchWinner(tournamentId, nextRoundNum, targetMatch.id, nextWinner);
              }, 100);
            }
          }
        }
      }

      return {
        ...t,
        rounds: updatedRounds,
        status,
        winner: tournamentWinner
      };
    }));
  };

  const resetTournament = (tournamentId: string) => {
    setTournaments(prev => prev.map(t => {
      if (t.id !== tournamentId) return t;

      const players = t.players;
      const size = t.rounds[0].matches.length * 2;
      const paddedPlayers = [...players];
      while (paddedPlayers.length < size) {
        paddedPlayers.push('BYE');
      }
      const shuffled = [...paddedPlayers].sort(() => Math.random() - 0.5);

      const rounds: TournamentRound[] = [];
      let numMatchesInRound = size / 2;
      let currentRound = 1;

      while (numMatchesInRound >= 1) {
        const matches: TournamentMatch[] = [];
        for (let i = 0; i < numMatchesInRound; i++) {
          let p1: string | null = null;
          let p2: string | null = null;

          if (currentRound === 1) {
            p1 = shuffled[2 * i];
            p2 = shuffled[2 * i + 1];
          }

          matches.push({
            id: `t_m_${currentRound}_${i}`,
            player1: p1,
            player2: p2,
            winner: null
          });
        }

        rounds.push({
          roundNumber: currentRound,
          matches
        });

        numMatchesInRound /= 2;
        currentRound++;
      }

      const round1 = rounds[0];
      const nextRound = rounds[1];

      round1.matches.forEach((match, idx) => {
        if (match.player1 === 'BYE' && match.player2 === 'BYE') {
          match.winner = 'Ninguém';
        } else if (match.player1 === 'BYE') {
          match.winner = match.player2;
        } else if (match.player2 === 'BYE') {
          match.winner = match.player1;
        }

        if (match.winner && match.winner !== 'Ninguém' && nextRound) {
          const nextMatchIdx = Math.floor(idx / 2);
          const nextPlayerKey = idx % 2 === 0 ? 'player1' : 'player2';
          nextRound.matches[nextMatchIdx][nextPlayerKey] = match.winner;
        }
      });

      return {
        ...t,
        rounds,
        status: 'active',
        winner: null
      };
    }));
  };

  const deleteTournament = (tournamentId: string) => {
    setTournaments(prev => prev.filter(t => t.id !== tournamentId));
  };

  // --- Profile Functions ---
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const togglePremium = () => {
    setProfile(prev => ({ ...prev, isPremium: !prev.isPremium }));
  };

  return (
    <AppContext.Provider
      value={{
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
        collection,
        addToCollection,
        removeFromCollection,
        customAlbums,
        createCustomAlbum,
        deleteCustomAlbum,
        addCardToCustomAlbum,
        removeCardFromCustomAlbum,
        favorites,
        toggleFavorite,
        isFavorite,
        decks,
        createDeck,
        deleteDeck,
        updateDeck,
        renameDeck,
        tournaments,
        createTournament,
        declareMatchWinner,
        resetTournament,
        deleteTournament,
        profile,
        updateProfile,
        togglePremium,
        allCards,
        loadingCards,
        loadingError,
        updateCardsDatabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

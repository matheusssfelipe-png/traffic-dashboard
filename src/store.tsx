'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Client } from './types';
import { sampleClients, generateId } from './data';

const STORAGE_KEY = 'matty_leadflix_clients_v2';

type Action =
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'ADD_CLIENT'; payload: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_CLIENT'; payload: { id: string; data: Partial<Client> } }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'RESET_TO_SAMPLE' };

interface State {
  clients: Client[];
  isLoaded: boolean;
}

interface StoreContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  resetToSample: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload, isLoaded: true };
    case 'ADD_CLIENT': {
      const now = new Date().toISOString();
      const newClient: Client = {
        ...action.payload,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, clients: [...state.clients, newClient] };
    }
    case 'UPDATE_CLIENT': {
      return {
        ...state,
        clients: state.clients.map(c =>
          c.id === action.payload.id
            ? { ...c, ...action.payload.data, updatedAt: new Date().toISOString() }
            : c
        ),
      };
    }
    case 'DELETE_CLIENT':
      return { ...state, clients: state.clients.filter(c => c.id !== action.payload) };
    case 'RESET_TO_SAMPLE':
      return { ...state, clients: sampleClients };
    default:
      return state;
  }
}

export function ClientProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { clients: [], isLoaded: false });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'SET_CLIENTS', payload: parsed });
        } else {
          dispatch({ type: 'SET_CLIENTS', payload: sampleClients });
        }
      } else {
        dispatch({ type: 'SET_CLIENTS', payload: sampleClients });
      }
    } catch {
      dispatch({ type: 'SET_CLIENTS', payload: sampleClients });
    }
  }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    if (state.isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.clients));
    }
  }, [state.clients, state.isLoaded]);

  const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_CLIENT', payload: client });
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    dispatch({ type: 'UPDATE_CLIENT', payload: { id, data } });
  };

  const deleteClient = (id: string) => {
    dispatch({ type: 'DELETE_CLIENT', payload: id });
  };

  const getClient = (id: string) => state.clients.find(c => c.id === id);

  const resetToSample = () => {
    dispatch({ type: 'RESET_TO_SAMPLE' });
  };

  return (
    <StoreContext.Provider value={{ state, dispatch, addClient, updateClient, deleteClient, getClient, resetToSample }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a ClientProvider');
  }
  return context;
}

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import api from '../services/api';

interface CatContextType {
  cats: any[];
  currentCat: any;
  isLoading: boolean;
  fetchCats: () => Promise<void>;
  getCatDetails: (id: string) => Promise<void>;
  addCat: (data: any) => Promise<void>;
  updateCat: (id: string, data: any) => Promise<void>;
  deleteCat: (id: string) => Promise<void>;
}

const CatContext = createContext<CatContextType>({} as CatContextType);

export const CatProvider = ({ children }: { children: ReactNode }) => {
  const [cats, setCats] = useState<any[]>([]);
  const [currentCat, setCurrentCat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/cats');
      if (res.success) setCats(res.data.cats);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCatDetails = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/cats/${id}`);
      if (res.success) setCurrentCat(res.data.cat);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCat = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.post('/cats', data);
      if (res.success) await fetchCats();
    } finally {
      setIsLoading(false);
    }
  };

  const updateCat = async (id: string, data: any) => {
    setIsLoading(true);
    try {
      const res = await api.put(`/cats/${id}`, data);
      if (res.success) {
        await fetchCats();
        setCurrentCat(res.data.cat);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCat = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/cats/${id}`);
      await fetchCats();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CatContext.Provider value={{ cats, currentCat, isLoading, fetchCats, getCatDetails, addCat, updateCat, deleteCat }}>
      {children}
    </CatContext.Provider>
  );
};

export const useCats = () => useContext(CatContext);
import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api.service';

const CatContext = createContext();

export const CatProvider = ({ children }) => {
  const [cats, setCats] = useState([]);
  const [currentCat, setCurrentCat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/cats');
      setCats(response.data?.cats || []);
    } catch (err) {
      console.error('Fetch Cats Error:', err);
      setError(err.message || 'Failed to fetch cats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCatDetails = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/cats/${id}`);
      setCurrentCat(response.data.cat);
      return response.data.cat;
    } catch (err) {
      console.error('Get Cat Details Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCat = useCallback(async (catData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/cats', catData);
      await fetchCats();
      return response.data.cat;
    } catch (err) {
      console.error('Add Cat Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCats]);

  const updateCat = useCallback(async (id, updateData) => {
    setIsLoading(true);
    try {
      const response = await api.put(`/cats/${id}`, updateData);
      setCats(prev => prev.map(cat => cat.id === id ? response.data.cat : cat));
      setCurrentCat(response.data.cat);
      return response.data.cat;
    } catch (err) {
      console.error('Update Cat Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCat = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await api.delete(`/cats/${id}`);
      setCats(prev => prev.filter(cat => cat.id !== id));
      if (currentCat && currentCat.id === id) setCurrentCat(null);
    } catch (err) {
      console.error('Delete Cat Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentCat]);

  return (
    <CatContext.Provider value={{ cats, currentCat, isLoading, error, fetchCats, getCatDetails, addCat, updateCat, deleteCat }}>
      {children}
    </CatContext.Provider>
  );
};

export const useCats = () => useContext(CatContext);
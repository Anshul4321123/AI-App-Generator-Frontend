import { useEffect, useState, useCallback } from 'react';
import { DataRecord } from '../types';
import { recordsApi } from '../services/api';

export function useRecords(entity: string) {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!entity) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await recordsApi.getAll(entity);
      setRecords(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch records:', err);
      setError(err.response?.data?.error || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [entity]);

  const createRecord = async (data: any) => {
    try {
      // Format date properly
      const formattedData = { ...data };
      if (formattedData.due_date && formattedData.due_date !== '') {
        formattedData.due_date = new Date(formattedData.due_date).toISOString().split('T')[0];
      }
      
      const response = await recordsApi.create(entity, formattedData);
      await fetchRecords();
      return response.data.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to create record';
      throw new Error(errorMsg);
    }
  };

  const updateRecord = async (id: string, data: any) => {
    try {
      const formattedData = { ...data };
      if (formattedData.due_date && formattedData.due_date !== '') {
        formattedData.due_date = new Date(formattedData.due_date).toISOString().split('T')[0];
      }
      const response = await recordsApi.update(entity, id, formattedData);
      await fetchRecords();
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update record');
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await recordsApi.delete(entity, id);
      await fetchRecords();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to delete record');
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [entity, fetchRecords]);

  return {
    records,
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords,
  };
}
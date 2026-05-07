import { useEffect, useState } from 'react';
import { DataRecord } from '../types';
import { recordsApi } from '../services/api';

export function useRecords(entity: string) {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await recordsApi.getAll(entity);
      setRecords(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch records:', err);
      setError(err.response?.data?.error || 'Failed to load records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (data: any) => {
    try {
      const response = await recordsApi.create(entity, data);
      await fetchRecords();
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to create record');
    }
  };

  const updateRecord = async (id: string, data: any) => {
    try {
      const response = await recordsApi.update(entity, id, data);
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
    if (entity) {
      fetchRecords();
    }
  }, [entity]);

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
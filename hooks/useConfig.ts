import { useEffect, useState } from 'react';
import { AppConfig } from '../types';
import api from '../services/api';

export function useConfig(appId: string) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appId) {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('📡 Fetching config for app:', appId);
        const response = await api.get(`/api/apps/${appId}`);
        console.log('✅ Config response:', response.data);
        
        const appData = response.data.data;
        
        // Ensure the config has the expected structure
        const formattedConfig: AppConfig = {
          id: appData.id,
          name: appData.name,
          pages: appData.config?.pages || [],
          config: appData.config || {}
        };
        
        console.log('📋 Formatted config:', formattedConfig);
        console.log('📄 Pages in config:', formattedConfig.pages);
        
        setConfig(formattedConfig);
      } catch (err: any) {
        console.error('❌ Failed to fetch config:', err);
        setError(err.response?.data?.error || 'Failed to load configuration');
        // Fallback empty config
        setConfig({
          id: appId,
          name: 'Unknown App',
          pages: [],
          config: {}
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [appId]);

  return { config, loading, error };
}
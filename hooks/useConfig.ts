import { useEffect, useState } from 'react';
import { AppConfig } from '../types';
import api from '../services/api';
import { normalizeConfig, validateConfig } from '../utils/normalizeConfig';

export function useConfig(appId: string) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (!appId) {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      setWarnings([]);
      try {
        console.log('📡 Fetching config for app:', appId);
        const response = await api.get(`/api/apps/${appId}`);
        
        const rawConfig = response.data.data;
        console.log('📋 Raw config:', rawConfig);
        
        // Validate and log warnings
        const validationWarnings = validateConfig(rawConfig?.config || rawConfig);
        if (validationWarnings.length > 0) {
          console.warn('⚠️ Config warnings:', validationWarnings);
          setWarnings(validationWarnings);
        }
        
        // Normalize the config (makes it safe to render)
        const normalizedConfig = normalizeConfig(rawConfig?.config || rawConfig);
        normalizedConfig.id = rawConfig.id;
        normalizedConfig.name = rawConfig.name;
        
        console.log('✅ Normalized config:', normalizedConfig);
        
        setConfig(normalizedConfig);
      } catch (err: any) {
        console.error('❌ Failed to fetch config:', err);
        setError(err.response?.data?.error || 'Failed to load configuration');
        // Return a safe fallback config
        setConfig({
          id: appId,
          name: 'Unknown App',
          pages: [],
          config: {},
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [appId]);

  return { config, loading, error, warnings };
}
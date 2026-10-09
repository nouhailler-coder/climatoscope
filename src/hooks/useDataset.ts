/**
 * ClimatOSCOPE — useDataset Hook
 */
import { useEffect, useState, useCallback } from 'react';
import { validateTimeSeriesData } from '../analysis/quality';
import { datasetService } from '../services/dataset-service';
import { CacheStatus } from '../types/api';
import { DataQualityReport, InternalDataset } from '../types/dataset';

export function useDataset(datasetId: string) {
  const [dataset, setDataset] = useState<InternalDataset | null>(null);
  const [status, setStatus] = useState<CacheStatus>('syncing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await datasetService.getDataset(datasetId, forceRefresh);
      setDataset(res.dataset);
      setStatus(res.status);

      if (res.dataset && res.dataset.data) {
        const { report } = validateTimeSeriesData(res.dataset.data, datasetId);
        setQualityReport(report);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du chargement des données');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const refresh = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  return { dataset, status, loading, error, qualityReport, refresh };
}

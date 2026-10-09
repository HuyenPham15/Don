import { useState, useEffect, useCallback } from 'react';
import { donService, type GhepDonPayload } from '../services/donService';
import type { LuotNhan } from '../types';

export function useDonData(initialStatus?: string) {
  const [donList, setDonList] = useState<LuotNhan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await donService.getDonList(initialStatus ? { status: initialStatus } : undefined);
      setDonList(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn');
    } finally {
      setLoading(false);
    }
  }, [initialStatus]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const ghepDon = async (id: string, payload: GhepDonPayload) => {
    const res = await donService.ghepDon(id, payload);
    await fetchList();
    return res;
  };

  const createDon = async (payload: Partial<LuotNhan>) => {
    const res = await donService.createDon(payload);
    await fetchList();
    return res;
  };

  return {
    donList,
    loading,
    error,
    refresh: fetchList,
    ghepDon,
    createDon,
  };
}

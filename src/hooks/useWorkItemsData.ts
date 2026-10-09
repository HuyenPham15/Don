import { useState, useEffect, useCallback } from 'react';
import { workService } from '../services/workService';
import type { WorkItem } from '../types/work';

export function useWorkItemsData(initialColumn?: string) {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workService.getWorkItems(initialColumn ? { column: initialColumn } : undefined);
      setWorkItems(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  }, [initialColumn]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateProgress = async (id: string, updates: Partial<WorkItem>) => {
    const updated = await workService.updateWorkItem(id, updates);
    setWorkItems((prev) => prev.map((item) => (item.id === id || item.code === id ? { ...item, ...updates } : item)));
    return updated;
  };

  return {
    workItems,
    loading,
    error,
    refresh: fetchItems,
    updateProgress,
  };
}

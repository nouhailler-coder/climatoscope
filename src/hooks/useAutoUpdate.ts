import { useEffect, useState } from 'react';
import { updateService, UpdateStatus } from '../services/update-service';

export function useAutoUpdate() {
  const [status, setStatus] = useState<UpdateStatus>(updateService.getStatus());

  useEffect(() => {
    const unsubscribe = updateService.subscribe(setStatus);
    return () => unsubscribe();
  }, []);

  const checkForUpdates = () => updateService.checkForUpdates(true);
  const forceUpdate = () => updateService.forceUpdate();

  return {
    ...status,
    checkForUpdates,
    forceUpdate,
  };
}

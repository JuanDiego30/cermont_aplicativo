import { useCallback, useState } from 'react';

export function useBoolean(initial = false){
  const [value, set] = useState<boolean>(initial);
  const setTrue = useCallback(()=>set(true),[]);
  const setFalse = useCallback(()=>set(false),[]);
  const toggle  = useCallback(()=>set(v=>!v),[]);
  return { value, setTrue, setFalse, toggle };
}

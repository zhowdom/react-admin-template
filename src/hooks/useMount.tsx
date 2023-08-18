import { useEffect } from 'react';

function useMount(callback: () => void) {
  useEffect(() => {
    callback();
  });
}
export default useMount;

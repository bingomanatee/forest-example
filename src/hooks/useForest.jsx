import { useEffect, useRef, useState } from 'react';
import { Forest } from '@wonderlandlabs/forest';

export default function useForest(configFactory, input, opts) {
  // we are storing the forest instance in a ref because we hve to make sure that it only gets set once.
  const stateRef = useRef(null);

  const [value, setValue] = useState({});
  useEffect(() => {
    const def = typeof configFactory === 'function' ? configFactory(input) : configFactory;
    if (!stateRef.current) {
      stateRef.current = new Forest(def);
      if (opts && opts.onCreate) {
        opts.onCreate(stateRef.current, input);
      }
    }

    if (!stateRef.current) return;

    const sub = stateRef.current.subscribe(setValue);

    return () => (sub ? sub.unsubscribe() : null);
  }, []); // deliberately not using def; only want this to run once whatever.

  return [value, stateRef.current];
}

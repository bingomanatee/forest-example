import { useEffect, useState } from 'react';
import { isEqual, pick } from 'lodash';

export default function useGlobalForest(forest, props) {
  // listens to a shared state, simply copies its value out
  const [value, setValue] = useState(forest.value);
  useEffect(() => {
    if (props) {
      let valueMapper = props;
      if (Array.isArray(props)) {
        valueMapper = (value) => pick(value, props);
      }
      const propSub = forest.select((newValue) => {
        if (!isEqual(newValue, value)) {
          setValue(newValue);
        }
      }, valueMapper);
      return () => propSub.unsubscribe();
    }

    const sub = forest.subscribe(setValue);
    return () => sub?.unsubscribe();
  }, [forest]); // deliberately not using props; only want this to run once whatever.

  return value;
}

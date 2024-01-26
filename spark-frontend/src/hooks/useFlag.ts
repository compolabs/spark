import { useCallback, useState } from "react";

type FlagReturns = [boolean, () => void, () => void];

const useFlag = (initial = false): FlagReturns => {
  const [value, setValue] = useState(initial);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, setTrue, setFalse];
};

export default useFlag;

import { useEffect, useState } from "react";

const useTimer = (lastCollected, maxCollection) => {
  const [time, setTime] = useState(
    lastCollected?.add(maxCollection) - new Date().getTime() / 1000
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time - 1);

      if (time <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  useEffect(() => {
    setTime(lastCollected?.add(maxCollection) - new Date().getTime() / 1000);
  }, [lastCollected, maxCollection]);

  return {
    time,
    percentFull: Math.max(
      0,
      Math.round((100 * (maxCollection - time)) / maxCollection)
    ),
  };
};

export default useTimer;

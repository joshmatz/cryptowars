import { useEffect, useState } from "react";

const BrowserOnly = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
  }, []);
  return mounted ? children : null;
};

export default BrowserOnly;

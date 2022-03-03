import React, { useEffect, useState } from "react";

const BrowserOnly = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
  }, [mounted]);
  return mounted ? children : null;
};

export default BrowserOnly;

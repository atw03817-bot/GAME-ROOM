import { useEffect, useState } from 'react';

export default function Price({ value, currency = 'ر.س', className = '' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>{value} {currency}</span>;
  }

  return <span className={className}>{value.toLocaleString()} {currency}</span>;
}

'use client';
import React, { FC } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
}

const ClientOnly: FC<ClientOnlyProps> = ({ children }) => {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return <div>{hasMounted ? children : null}</div>;
};

export default ClientOnly;

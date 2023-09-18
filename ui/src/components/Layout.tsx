import { Container } from '@chakra-ui/react';
import React from 'react';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }: LayoutProps) => {
  return (
    <Container maxW="container.sm" height="100vh">
      {children}
    </Container>
  );
};

export default Layout;
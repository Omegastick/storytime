import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import Layout from './components/Layout';
import TTSPage from './components/TTSPage';

const App: React.FC = () => {
  return (
    <div>
      <ChakraProvider>
        <Layout>
          <TTSPage />
        </Layout>
      </ChakraProvider>
    </div>
  );
};

export default App;
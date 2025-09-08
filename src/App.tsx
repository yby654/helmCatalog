import React from 'react';
import HelmHub from './components/HelmHub';

export default function App() {
  return (
    <HelmHub
      showHeader={true}
      title="Helm Chart Catalog"
      subtitle="Browse and deploy Helm charts from your private registry"
      height="100vh"
    />
  );
}
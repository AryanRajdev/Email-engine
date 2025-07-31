import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import CreateCampaign from './pages/CreateCampaign.jsx';
import CampaignDetail from './pages/CampaignDetail.jsx';
import Layout from './components/Layout.jsx';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/campaigns/new" element={<CreateCampaign />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;

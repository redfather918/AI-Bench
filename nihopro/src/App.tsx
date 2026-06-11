import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from './components/Layout/AppLayout';
import KnowledgeHome from './pages/KnowledgeHome';
import KnowledgeDetail from './pages/KnowledgeDetail';
import AIAssistant from './pages/AIAssistant';
import SalesWorkbench from './pages/SalesWorkbench';
import ManagerDashboard from './pages/ManagerDashboard';
import SOPConfig from './pages/SOPConfig';
import CaseLibrary from './pages/CaseLibrary';

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#e94560',
          borderRadius: 6,
        },
      }}
    >
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/knowledge" replace />} />
            <Route path="/knowledge" element={<KnowledgeHome />} />
            <Route path="/knowledge/:id" element={<KnowledgeDetail />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/workbench" element={<SalesWorkbench />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/cases" element={<CaseLibrary />} />
            <Route path="/settings" element={<SOPConfig />} />
          </Route>
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
}

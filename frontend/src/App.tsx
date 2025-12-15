import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import Welcome from './pages/Welcome';
import Layout from './components/Layout';
import { useOrganization } from './context/OrganizationContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { organization } = useOrganization();

  if (!organization) {
    return <Navigate to="/welcome" replace />;
  }
  return <Layout>{children}</Layout>;
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

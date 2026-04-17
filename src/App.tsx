import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { UserProvider, useUser } from './hooks/useUser';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import MonsterTruckCount from './games/math/MonsterTruckCount';
import SpaceMissionSupplies from './games/math/SpaceMissionSupplies';
import ArithmeticArena from './games/math/ArithmeticArena';
import AstroTyper from './games/typing/AstroTyper';
import SkateboardWordMatch from './games/reading/SkateboardSoundMatch';

const AppContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const AppRoutes = () => {
  const { currentUser } = useUser();

  return (
    <Routes>
      <Route 
        path="/" 
        element={currentUser ? <Navigate to="/dashboard" /> : <Home />} 
      />
      <Route 
        path="/dashboard" 
        element={currentUser ? <Dashboard /> : <Navigate to="/" />} 
      />
      <Route 
        path="/math/charlie" 
        element={currentUser ? <MonsterTruckCount /> : <Navigate to="/" />} 
      />
      <Route 
        path="/math/grace" 
        element={currentUser ? <SpaceMissionSupplies /> : <Navigate to="/" />} 
      />
      <Route 
        path="/math/arithmetic" 
        element={currentUser ? <ArithmeticArena /> : <Navigate to="/" />} 
      />
      <Route 
        path="/typing" 
        element={currentUser ? <AstroTyper /> : <Navigate to="/" />} 
      />
      <Route 
        path="/reading" 
        element={currentUser ? <SkateboardWordMatch /> : <Navigate to="/" />} 
      />
    </Routes>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContainer>
          <AppRoutes />
        </AppContainer>
      </Router>
    </UserProvider>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { UserProvider, useUser } from './hooks/useUser';
import GlobalStarfield from './components/GlobalStarfield';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Counting from './games/math/Counting';
import Multiplication from './games/math/Multiplication';
import ArithmeticArena from './games/math/ArithmeticArena';
import AstroTyper from './games/typing/AstroTyper';
import CodeCaterpillar from './games/coding/CodeCaterpillar';
import SkateboardWordMatch from './games/reading/SkateboardSoundMatch';
import RhymeTime from './games/reading/RhymeTime';

const AppContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
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
        path="/math/counting" 
        element={currentUser ? <Counting /> : <Navigate to="/" />} 
      />
      <Route 
        path="/math/multiplication" 
        element={currentUser ? <Multiplication /> : <Navigate to="/" />} 
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
        path="/coding" 
        element={currentUser ? <CodeCaterpillar /> : <Navigate to="/" />} 
      />
      <Route 
        path="/reading" 
        element={currentUser ? <SkateboardWordMatch /> : <Navigate to="/" />} 
      />
      <Route 
        path="/reading/rhyme-time" 
        element={currentUser ? <RhymeTime /> : <Navigate to="/" />} 
      />
    </Routes>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContainer>
          <GlobalStarfield />
          <AppRoutes />
        </AppContainer>
      </Router>
    </UserProvider>
  );
}

export default App;
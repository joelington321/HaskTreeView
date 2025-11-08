import { GlobalStyles } from './styles/GlobalStyles';
import { AppContainer } from './App.styles';
import { DashboardScreen } from './screens';

function App() {
  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <DashboardScreen />
      </AppContainer>
    </>
  );
}

export default App;

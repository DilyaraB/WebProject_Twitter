
import './App.css';
import './pages/MainPage.css'
import MainPage from './pages/MainPage'
import { BrowserRouter } from "react-router-dom";
function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <div className='main-page' >
      <BrowserRouter>
      <MainPage />
      </BrowserRouter>
      </div>
    </div>
  );
}

export default App;

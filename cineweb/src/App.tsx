import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import FilmesPage from './pages/FilmesPage';
import SalasPage from './pages/SalasPage';
import SessoesPage from './pages/SessoesPage';
import VendaIngressosPage from './pages/VendaIngressosPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-uppercase" to="/">
            <i className="bi bi-film me-2"></i> CineWeb
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarMain">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  Administração
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link className="dropdown-item" to="/filmes">Gerenciar Filmes</Link></li>
                    <li><Link className="dropdown-item" to="/salas">Gerenciar Salas</Link></li>
                    <li><hr className="dropdown-divider"/></li>
                    <li><Link className="dropdown-item" to="/sessoes">Gerenciar Sessões</Link></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/filmes" element={<div className="container py-4"><FilmesPage /></div>} />
          <Route path="/salas" element={<div className="container py-4"><SalasPage /></div>} />
          <Route path="/sessoes" element={<div className="container py-4"><SessoesPage /></div>} />
          <Route path="/venda-ingressos" element={<div className="container py-4"><VendaIngressosPage /></div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
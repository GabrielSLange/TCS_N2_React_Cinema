import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Filme, Sessao, Sala } from '../types';

export default function HomePage() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resFilmes, resSessoes, resSalas] = await Promise.all([
          fetch('http://localhost:3000/filmes'),
          fetch('http://localhost:3000/sessoes'),
          fetch('http://localhost:3000/salas')
        ]);
        
        setFilmes(await resFilmes.json());
        setSessoes(await resSessoes.json());
        setSalas(await resSalas.json());
      } catch (error) {
        console.error("Erro ao carregar catálogo", error);
      }
    };
    carregarDados();
  }, []);

  const getSessoesPorFilme = (filmeId: string) => {
    const agora = new Date();
    return sessoes
      .filter(s => s.filmeId === filmeId && new Date(s.dataHora) > agora)
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
  };

  const getNomeSala = (id: string) => salas.find(s => s.id === id)?.nome || "Sala";

  return (
    <div>
      <div className="bg-dark text-white p-5 mb-5 rounded shadow" style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
      }}>
        <div className="container">
          <h1 className="display-3 fw-bold">Bem-vindo ao CineWeb</h1>
          <p className="lead fs-4">A melhor experiência cinematográfica da cidade.</p>
          <p className="mb-4">Confira os filmes em cartaz e garanta seu ingresso agora mesmo!</p>
          <a href="#em-cartaz" className="btn btn-danger btn-lg px-5 rounded-pill">
            Ver Programação
          </a>
        </div>
      </div>

      <div id="em-cartaz" className="container mb-5">
        <h2 className="border-start border-4 border-danger ps-3 mb-4">Em Cartaz</h2>
        
        <div className="row g-4">
          {filmes.map(filme => {
            const sessoesDoFilme = getSessoesPorFilme(filme.id);
            const temSessoes = sessoesDoFilme.length > 0;

            // eslint-disable-next-line react-hooks/purity
            const bgCor = '#' + Math.floor(Math.random()*16777215).toString(16); 

            return (
              <div key={filme.id} className="col-md-6 col-lg-4 col-xl-3">
                <div className="card h-100 shadow-sm border-0 transition-hover">
                  <div className="card-img-top d-flex align-items-center justify-content-center text-white text-center p-3" 
                       style={{ height: '250px', backgroundColor: '#333', backgroundImage: `linear-gradient(45deg, #1a1a1a, ${bgCor})` }}>
                    <div>
                      <i className="bi bi-film display-1 opacity-25"></i>
                      <h5 className="mt-2 text-shadow">{filme.titulo}</h5>
                    </div>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <div className="mb-2">
                        <span className="badge bg-danger me-1">{filme.genero}</span>
                        <span className="badge bg-secondary">{filme.classificacao}</span>
                    </div>
                    <p className="card-text small text-muted flex-grow-1">
                        {filme.descricao.substring(0, 100)}...
                    </p>
                    
                    <hr />
                    
                    <h6 className="small fw-bold text-uppercase text-muted">Horários Disponíveis:</h6>
                    {temSessoes ? (
                      <div className="d-grid gap-2">
                        {sessoesDoFilme.slice(0, 3).map(sessao => (
                          <Link 
                            key={sessao.id}
                            to={`/venda-ingressos?sessaoId=${sessao.id}`} 
                            className="btn btn-outline-primary btn-sm d-flex justify-content-between align-items-center"
                          >
                            <span>{new Date(sessao.dataHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <small className="text-muted">{getNomeSala(sessao.salaId)}</small>
                            <span className="badge bg-success ms-2">R$ {sessao.preco}</span>
                          </Link>
                        ))}
                        {sessoesDoFilme.length > 3 && <small className="text-center text-muted">Mais horários disponíveis...</small>}
                      </div>
                    ) : (
                      <div className="alert alert-warning py-2 small text-center">
                        Sem sessões futuras.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filmes.length === 0 && (
            <div className="col-12 text-center py-5">
              <p className="text-muted fs-5">Nenhum filme cadastrado no momento.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-dark text-white py-4 mt-auto">
        <div className="container text-center">
            <p className="mb-0">&copy; 2025 CineWeb System. Todos os direitos reservados.</p>
            <small className="mb-0">Desenvolvido para fins acadêmicos.</small>
        </div>
      </footer>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import type { Filme, Sala, Sessao } from '../types';

const sessaoSchema = z.object({
  filmeId: z.string().min(1, "Selecione um filme"),
  salaId: z.string().min(1, "Selecione uma sala"),
  dataHora: z.string().refine((data) => new Date(data) > new Date(), {
    message: "A data da sessão deve ser futura (não retroativa)"
  }),
  preco: z.number().positive("O preço deve ser positivo"),
});

type SessaoSchema = z.infer<typeof sessaoSchema>;

export default function SessoesPage() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  
  const navigate = useNavigate();
  const [atualizar, setAtualizar] = useState(0);

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<SessaoSchema>({
    resolver: zodResolver(sessaoSchema)
  });

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [resSessoes, resFilmes, resSalas] = await Promise.all([
          fetch('http://localhost:3000/sessoes'),
          fetch('http://localhost:3000/filmes'),
          fetch('http://localhost:3000/salas')
        ]);

        const dataSessoes = await resSessoes.json();
        const dataFilmes = await resFilmes.json();
        const dataSalas = await resSalas.json();

        setSessoes(dataSessoes);
        setFilmes(dataFilmes);
        setSalas(dataSalas);
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    };

    fetchDados();
  }, [atualizar]);

  const onSubmit = async (data: SessaoSchema) => {
    const filmeSelecionado = filmes.find(f => f.id === data.filmeId);

    if (filmeSelecionado && filmeSelecionado.estreia) {
      const dataSessao = new Date(data.dataHora);
      const dataEstreia = new Date(filmeSelecionado.estreia + "T00:00:00");
      dataEstreia.setHours(0, 0, 0, 0);

      if (dataSessao < dataEstreia) {
        setError("dataHora", {
          type: "manual",
          message: `Impossível agendar! O filme só estreia em ${dataEstreia.toLocaleDateString('pt-BR')}`
        });
        return;
      }
    }

    try {
      await fetch('http://localhost:3000/sessoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      reset();
      setAtualizar(prev => prev + 1);
      alert("Sessão agendada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar", error);
    }
  };
  const excluirSessao = async (id: string) => {
    if (!confirm("Tem certeza que deseja cancelar esta sessão?")) return;
    await fetch(`http://localhost:3000/sessoes/${id}`, { method: 'DELETE' });
    setAtualizar(prev => prev + 1); // Força a atualização da tabela
  };

  const getNomeFilme = (id: string) => filmes.find(f => f.id === id)?.titulo || "Filme não encontrado";
  const getNomeSala = (id: string) => salas.find(s => s.id === id)?.nome || "Sala removida";

  const irParaVenda = (sessaoId: string) => {
    navigate(`/venda-ingressos?sessaoId=${sessaoId}`);
  };

  return (
    <div>
      <h2 className="mb-4">Agendamento de Sessões</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="row g-3 mb-5 p-4 border rounded bg-light">
        <div className="col-md-6">
          <label className="form-label">Filme</label>
          <select {...register("filmeId")} className={`form-select ${errors.filmeId ? 'is-invalid' : ''}`}>
            <option value="">Selecione um filme...</option>
            {filmes.map(filme => (
              <option key={filme.id} value={filme.id}>{filme.titulo}</option>
            ))}
          </select>
          {errors.filmeId && <div className="invalid-feedback">{errors.filmeId.message}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label">Sala</label>
          <select {...register("salaId")} className={`form-select ${errors.salaId ? 'is-invalid' : ''}`}>
            <option value="">Selecione uma sala...</option>
            {salas.map(sala => (
              <option key={sala.id} value={sala.id}>{sala.nome} ({sala.tipo})</option>
            ))}
          </select>
          {errors.salaId && <div className="invalid-feedback">{errors.salaId.message}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label">Data e Horário</label>
          <input 
            type="datetime-local" 
            {...register("dataHora")} 
            className={`form-control ${errors.dataHora ? 'is-invalid' : ''}`} 
          />
          {errors.dataHora && <div className="invalid-feedback">{errors.dataHora.message}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label">Preço do Ingresso (R$)</label>
          <input 
            type="number" 
            step="0.01"
            {...register("preco", { valueAsNumber: true })} 
            className={`form-control ${errors.preco ? 'is-invalid' : ''}`} 
          />
          {errors.preco && <div className="invalid-feedback">{errors.preco.message}</div>}
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            <i className="bi bi-calendar-check me-2"></i> Agendar Sessão
          </button>
        </div>
      </form>

      <h3 className="mb-3">Sessões Agendadas</h3>
      <div className="row">
        {sessoes.map(sessao => (
          <div key={sessao.id} className="col-md-6 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{getNomeFilme(sessao.filmeId)}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{getNomeSala(sessao.salaId)}</h6>
                <p className="card-text">
                  <strong>Data:</strong> {new Date(sessao.dataHora).toLocaleString('pt-BR')} <br />
                  <strong>Preço:</strong> R$ {sessao.preco.toFixed(2)}
                </p>
                <div className="d-flex justify-content-between">
                    <button className="btn btn-outline-success btn-sm" onClick={() => irParaVenda(sessao.id)}>
                        <i className="bi bi-ticket-perforated"></i> Vender Ingresso
                    </button>
                    
                    <button className="btn btn-outline-danger btn-sm" onClick={() => excluirSessao(sessao.id)}>
                        <i className="bi bi-trash"></i> Cancelar
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {sessoes.length === 0 && <p className="text-muted">Nenhuma sessão agendada.</p>}
      </div>
    </div>
  );
}
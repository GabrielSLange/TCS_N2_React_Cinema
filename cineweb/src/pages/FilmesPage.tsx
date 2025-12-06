import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Filme } from '../types';

const filmeSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  genero: z.string().min(1, "Selecione um gênero"),
  descricao: z.string().min(10, "A sinopse deve ter pelo menos 10 caracteres"),
  classificacao: z.string(),
  duracao: z.number().positive("Duração deve ser maior que 0"),
  estreia: z.string(),
});

type FilmeSchema = z.infer<typeof filmeSchema>;

export default function FilmesPage() {
  const [filmes, setFilmes] = useState<Filme[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FilmeSchema>({
    resolver: zodResolver(filmeSchema)
  });

  
  const carregarFilmes = async () => {
    try {
      const response = await fetch('http://localhost:3000/filmes');
      const data = await response.json();
      setFilmes(data);
    } catch (error) {
      console.error("Erro ao buscar filmes", error);
    }
  };

  useEffect(() => {
    const fetchFilmes = async () => {
      await carregarFilmes();
    };
    fetchFilmes();
  }, []);

  const onSubmit = async (data: FilmeSchema) => {
    try {
      await fetch('http://localhost:3000/filmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      reset();
      carregarFilmes();
      alert("Filme cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar", error);
    }
  };

  const excluirFilme = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    
    await fetch(`http://localhost:3000/filmes/${id}`, { method: 'DELETE' });
    carregarFilmes();
  };

  return (
    <div>
      <h2>Gerenciamento de Filmes</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="row g-3 mb-5 p-4 border rounded bg-light">
        <div className="col-md-6">
          <label className="form-label">Título</label>
          <input {...register("titulo")} className={`form-control ${errors.titulo ? 'is-invalid' : ''}`} />
          {errors.titulo && <div className="invalid-feedback">{errors.titulo.message}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label">Gênero</label>
          <select {...register("genero")} className="form-select">
            <option value="">Selecione...</option>
            <option value="Ação">Ação</option>
            <option value="Comédia">Comédia</option>
            <option value="Drama">Drama</option>
            <option value="Terror">Terror</option>
          </select>
          {errors.genero && <div className="text-danger small">{errors.genero.message}</div>}
        </div>

        <div className="col-12">
          <label className="form-label">Sinopse (Descrição)</label>
          <textarea {...register("descricao")} className={`form-control ${errors.descricao ? 'is-invalid' : ''}`} rows={3}></textarea>
          {errors.descricao && <div className="invalid-feedback">{errors.descricao.message}</div>}
        </div>

        <div className="col-md-4">
          <label className="form-label">Duração (min)</label>
          <input type="number" {...register("duracao", { valueAsNumber: true })} className={`form-control ${errors.duracao ? 'is-invalid' : ''}`} />
          {errors.duracao && <div className="invalid-feedback">{errors.duracao.message}</div>}
        </div>

        <div className="col-md-4">
            <label className="form-label">Classificação</label>
            <select {...register("classificacao")} className="form-select">
                <option value="Livre">Livre</option>
                <option value="10">10 anos</option>
                <option value="12">12 anos</option>
                <option value="14">14 anos</option>
                <option value="16">16 anos</option>
                <option value="18">18 anos</option>
            </select>
        </div>

        <div className="col-md-4">
            <label className="form-label">Estreia</label>
            <input type="date" {...register("estreia")} className="form-control" />
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            <i className="bi bi-save me-2"></i> Salvar Filme
          </button>
        </div>
      </form>

      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>Título</th>
            <th>Gênero</th>
            <th>Duração</th>
            <th>Classificação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filmes.map(filme => (
            <tr key={filme.id}>
              <td>{filme.titulo}</td>
              <td>{filme.genero}</td>
              <td>{filme.duracao} min</td>
              <td>{filme.classificacao}</td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => excluirFilme(filme.id)}>
                    <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
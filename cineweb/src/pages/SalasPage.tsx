import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Sala } from '../types';

const salaSchema = z.object({
  nome: z.string().min(1, "O nome ou número da sala é obrigatório"),
  capacidade: z.number().positive("A capacidade deve ser maior que 0"),
  tipo: z.enum(["2D", "3D", "IMAX"], {
    message: "Selecione um tipo válido"
  }),
});

type SalaSchema = z.infer<typeof salaSchema>;

export default function SalasPage() {
  const [salas, setSalas] = useState<Sala[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SalaSchema>({
    resolver: zodResolver(salaSchema)
  });

  const carregarSalas = async () => {
    try {
      const response = await fetch('http://localhost:3000/salas');
      const data = await response.json();
      setSalas(data);
    } catch (error) {
      console.error("Erro ao buscar salas", error);
    }
  };

  useEffect(() => {
    const fetcarregarSalas = async () => {
      await carregarSalas();
    };
    fetcarregarSalas();
  }, []);

  const onSubmit = async (data: SalaSchema) => {
    try {
      await fetch('http://localhost:3000/salas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      reset();
      carregarSalas();
      alert("Sala cadastrada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar", error);
    }
  };

  const excluirSala = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta sala?")) return;
    await fetch(`http://localhost:3000/salas/${id}`, { method: 'DELETE' });
    carregarSalas();
  };

  return (
    <div>
      <h2 className="mb-4">Gerenciamento de Salas</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="row g-3 mb-5 p-4 border rounded bg-light">
        <div className="col-md-6">
          <label className="form-label">Nome ou Número da Sala</label>
          <input 
            type="text" 
            {...register("nome")} 
            className={`form-control ${errors.nome ? 'is-invalid' : ''}`} 
            placeholder="Ex: Sala 01 ou Sala VIP"
          />
          {errors.nome && <div className="invalid-feedback">{errors.nome.message}</div>}
        </div>

        <div className="col-md-3">
          <label className="form-label">Capacidade</label>
          <input 
            type="number" 
            {...register("capacidade", { valueAsNumber: true })} 
            className={`form-control ${errors.capacidade ? 'is-invalid' : ''}`} 
          />
          {errors.capacidade && <div className="invalid-feedback">{errors.capacidade.message}</div>}
        </div>

        <div className="col-md-3">
          <label className="form-label">Tipo de Sala</label>
          <select {...register("tipo")} className={`form-select ${errors.tipo ? 'is-invalid' : ''}`}>
            <option value="">Selecione...</option>
            <option value="2D">Standard (2D)</option>
            <option value="3D">3D</option>
            <option value="IMAX">IMAX</option>
          </select>
          {errors.tipo && <div className="invalid-feedback">{errors.tipo.message}</div>}
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-success">
            <i className="bi bi-building-add me-2"></i> Salvar Sala
          </button>
        </div>
      </form>

      <table className="table table-striped table-hover align-middle">
        <thead className="table-dark">
          <tr>
            <th>Identificação</th>
            <th>Capacidade</th>
            <th>Tipo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {salas.map(sala => (
            <tr key={sala.id}>
              <td className="fw-bold">{sala.nome}</td>
              <td>{sala.capacidade} pessoas</td>
              <td><span className="badge bg-secondary">{sala.tipo}</span></td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => excluirSala(sala.id)}>
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
          {salas.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted">Nenhuma sala cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
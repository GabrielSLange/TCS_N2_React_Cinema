import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Sessao, Filme, Sala } from '../types';

const vendaSchema = z.object({
  sessaoId: z.string(),
  cliente: z.string().min(3, "Nome do cliente é obrigatório"),
  cpf: z.string().length(11, "CPF deve ter 11 números (apenas números)"),
  assento: z.string().min(1, "Informe o assento (Ex: A1)"),
  tipo: z.enum(["Inteira", "Meia"], { message: "Selecione o tipo" }),
  valorPago: z.number().positive()
});

type VendaSchema = z.infer<typeof vendaSchema>;

export default function VendaIngressosPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessaoId = searchParams.get("sessaoId");

  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [filme, setFilme] = useState<Filme | null>(null);
  const [sala, setSala] = useState<Sala | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<VendaSchema>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      sessaoId: sessaoId || "",
      tipo: "Inteira",
      valorPago: 0
    }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const tipoSelecionado = watch("tipo");

  useEffect(() => {
    if (!sessaoId) return;

    const carregarDetalhes = async () => {
      try {
        const resSessao = await fetch(`http://localhost:3000/sessoes/${sessaoId}`);
        const dataSessao: Sessao = await resSessao.json();
        setSessao(dataSessao);

        const resFilme = await fetch(`http://localhost:3000/filmes/${dataSessao.filmeId}`);
        const dataFilme = await resFilme.json();
        setFilme(dataFilme);

        const resSala = await fetch(`http://localhost:3000/salas/${dataSessao.salaId}`);
        const dataSala = await resSala.json();
        setSala(dataSala);
      } catch (error) {
        console.error("Erro ao carregar detalhes", error);
        alert("Erro ao buscar sessão.");
      }
    };
    carregarDetalhes();
  }, [sessaoId]);

  useEffect(() => {
    if (sessao) {
      const precoFinal = tipoSelecionado === "Meia" ? sessao.preco / 2 : sessao.preco;
      setValue("valorPago", precoFinal);
    }
  }, [sessao, tipoSelecionado, setValue]);

  const onSubmit = async (data: VendaSchema) => {
    try {
      await fetch('http://localhost:3000/ingressos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      alert(`Venda realizada com sucesso! Valor: R$ ${data.valorPago.toFixed(2)}`);
      navigate("/sessoes");
    } catch (error) {
      console.error("Erro na venda", error);
    }
  };

  if (!sessao || !filme || !sala) return <div className="p-4">Carregando detalhes da sessão...</div>;

  return (
    <div>
      <h2 className="mb-4">Venda de Ingresso</h2>
      
      <div className="card mb-4 bg-light border-primary">
        <div className="card-body">
          <h4 className="card-title text-primary">{filme.titulo}</h4>
          <p className="card-text mb-1"><strong>Sala:</strong> {sala.nome} ({sala.tipo})</p>
          <p className="card-text mb-1"><strong>Data:</strong> {new Date(sessao.dataHora).toLocaleString('pt-BR')}</p>
          <p className="card-text"><strong>Preço Inteira:</strong> R$ {sessao.preco.toFixed(2)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="row g-3 p-4 border rounded shadow-sm">
        <input type="hidden" {...register("sessaoId")} />

        <div className="col-md-6">
          <label className="form-label">Nome do Cliente</label>
          <input {...register("cliente")} className={`form-control ${errors.cliente ? 'is-invalid' : ''}`} placeholder="Nome completo" />
          {errors.cliente && <div className="invalid-feedback">{errors.cliente.message}</div>}
        </div>

        <div className="col-md-3">
          <label className="form-label">CPF (somente números)</label>
          <input {...register("cpf")} className={`form-control ${errors.cpf ? 'is-invalid' : ''}`} placeholder="12345678900" />
          {errors.cpf && <div className="invalid-feedback">{errors.cpf.message}</div>}
        </div>

        <div className="col-md-3">
          <label className="form-label">Assento</label>
          <input {...register("assento")} className={`form-control ${errors.assento ? 'is-invalid' : ''}`} placeholder="Ex: F12" />
          {errors.assento && <div className="invalid-feedback">{errors.assento.message}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label">Tipo de Ingresso</label>
          <select {...register("tipo")} className="form-select">
            <option value="Inteira">Inteira</option>
            <option value="Meia">Meia-Entrada (50%)</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Valor Final (R$)</label>
          <input 
             type="number" 
             step="0.01" 
             {...register("valorPago")} 
             readOnly 
             className="form-control bg-secondary text-white fw-bold" 
          />
        </div>

        <div className="col-12 mt-4">
          <button type="submit" className="btn btn-success btn-lg w-100">
            <i className="bi bi-cart-check me-2"></i> Confirmar Venda
          </button>
        </div>
      </form>
    </div>
  );
}
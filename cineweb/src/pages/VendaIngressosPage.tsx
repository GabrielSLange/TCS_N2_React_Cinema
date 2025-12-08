import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Sessao, Filme, Sala, LancheCombo, ItemLancheSelecionado } from '../types';

const vendaSchema = z.object({
  sessaoId: z.string(),
  cliente: z.string().min(3, "Nome do cliente é obrigatório"),
  cpf: z.string().length(11, "CPF deve ter 11 números"),
  assento: z.string().min(1, "Informe o assento"),
  tipo: z.enum(["Inteira", "Meia"]),
  valorTotal: z.number()
});

type VendaSchema = z.infer<typeof vendaSchema>;

export default function VendaIngressosPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessaoId = searchParams.get("sessaoId");

  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [filme, setFilme] = useState<Filme | null>(null);
  const [sala, setSala] = useState<Sala | null>(null);
  
  const [lanchesDisponiveis, setLanchesDisponiveis] = useState<LancheCombo[]>([]);
  const [carrinhoLanches, setCarrinhoLanches] = useState<ItemLancheSelecionado[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<VendaSchema>({
    resolver: zodResolver(vendaSchema),
    defaultValues: { sessaoId: sessaoId || "", tipo: "Inteira", valorTotal: 0 }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const tipoIngresso = watch("tipo");

  useEffect(() => {
    if (!sessaoId) return;
    const carregarTudo = async () => {
      try {
        const [resSessao, resLanches] = await Promise.all([
            fetch(`http://localhost:3000/sessoes/${sessaoId}`),
            fetch(`http://localhost:3000/lanches`)
        ]);

        const dataSessao = await resSessao.json();
        setSessao(dataSessao);
        setLanchesDisponiveis(await resLanches.json());

        const [resFilme, resSala] = await Promise.all([
            fetch(`http://localhost:3000/filmes/${dataSessao.filmeId}`),
            fetch(`http://localhost:3000/salas/${dataSessao.salaId}`)
        ]);
        
        setFilme(await resFilme.json());
        setSala(await resSala.json());

      } catch (error) {
        console.error("Erro ao carregar", error);
      }
    };
    carregarTudo();
  }, [sessaoId]);

  const atualizarQuantidade = (lanche: LancheCombo, delta: number) => {
    setCarrinhoLanches(prev => {
        const existente = prev.find(item => item.id === lanche.id);
        const novaQtd = (existente ? existente.quantidade : 0) + delta;

        if (novaQtd <= 0) {
            return prev.filter(item => item.id !== lanche.id);
        }
        
        if (existente) {
            return prev.map(item => item.id === lanche.id ? { ...item, quantidade: novaQtd } : item);
        } else {
            return [...prev, { ...lanche, quantidade: novaQtd }];
        }
    });
  };

  useEffect(() => {
    if (sessao) {
      const precoIngresso = tipoIngresso === "Meia" ? sessao.preco / 2 : sessao.preco;
      
      const totalLanches = carrinhoLanches.reduce((acc, item) => {
          return acc + (item.preco * item.quantidade);
      }, 0);

      setValue("valorTotal", precoIngresso + totalLanches);
    }
  }, [sessao, tipoIngresso, carrinhoLanches, setValue]);


  const onSubmit = async (data: VendaSchema) => {
    const pedidoCompleto = {
        ...data,
        valorIngresso: tipoIngresso === "Meia" ? (sessao?.preco || 0)/2 : (sessao?.preco || 0),
        itensLanche: carrinhoLanches,
        dataPedido: new Date().toISOString()
    };

    try {
      await fetch('http://localhost:3000/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoCompleto)
      });
      alert(`Venda Confirmada!\nTotal: R$ ${data.valorTotal.toFixed(2)}\nLanches: ${carrinhoLanches.length} itens`);
      navigate("/sessoes");
    } catch (error) {
      console.error("Erro na venda", error);
    }
  };

  if (!sessao || !filme || !sala) return <div className="p-5 text-center">Carregando...</div>;

  return (
    <div>
      <h2 className="mb-4"><i className="bi bi-cart4"></i> Realizar Pedido</h2>
      
      <div className="row">
          <div className="col-md-7">
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                    Dados do Ingresso
                </div>
                <div className="card-body">
                    <h5 className="card-title">{filme.titulo}</h5>
                    <p className="text-muted small mb-3">{sala.nome} - {new Date(sessao.dataHora).toLocaleString()}</p>
                    
                    <form id="formVenda" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                        <input type="hidden" {...register("sessaoId")} />
                        
                        <div className="col-md-8">
                            <label className="form-label">Nome do Cliente</label>
                            <input {...register("cliente")} className={`form-control ${errors.cliente ? 'is-invalid' : ''}`} />
                            {errors.cliente && <div className="invalid-feedback">{errors.cliente.message}</div>}
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">CPF</label>
                            <input {...register("cpf")} className={`form-control ${errors.cpf ? 'is-invalid' : ''}`} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Assento</label>
                            <input {...register("assento")} className={`form-control ${errors.assento ? 'is-invalid' : ''}`} />
                        </div>
                        <div className="col-md-8">
                            <label className="form-label">Tipo de Ingresso</label>
                            <select {...register("tipo")} className="form-select">
                                <option value="Inteira">Inteira (R$ {sessao.preco.toFixed(2)})</option>
                                <option value="Meia">Meia (R$ {(sessao.preco / 2).toFixed(2)})</option>
                            </select>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-warning text-dark">
                    <i className="bi bi-cup-straw"></i> Adicionar Lanches & Combos
                </div>
                <div className="card-body p-0">
                    <div className="list-group list-group-flush">
                        {lanchesDisponiveis.map(lanche => {
                            const noCarrinho = carrinhoLanches.find(i => i.id === lanche.id)?.quantidade || 0;
                            return (
                                <div key={lanche.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0">{lanche.nome}</h6>
                                        <small className="text-muted">R$ {lanche.preco.toFixed(2)}</small>
                                    </div>
                                    <div className="btn-group btn-group-sm">
                                        <button type="button" className="btn btn-outline-secondary" 
                                            onClick={() => atualizarQuantidade(lanche, -1)} disabled={noCarrinho === 0}>-</button>
                                        <span className="btn btn-light border" style={{width: '40px'}}>{noCarrinho}</span>
                                        <button type="button" className="btn btn-outline-secondary" 
                                            onClick={() => atualizarQuantidade(lanche, 1)}>+</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
          </div>

          <div className="col-md-5">
              <div className="card bg-light border-0 shadow sticky-top" style={{top: '20px', zIndex: 1}}>
                  <div className="card-body">
                      <h4 className="card-title mb-4">Resumo do Pedido</h4>
                      
                      <div className="d-flex justify-content-between mb-2">
                          <span>Ingresso ({tipoIngresso})</span>
                          <span>R$ {(tipoIngresso === "Meia" ? sessao.preco/2 : sessao.preco).toFixed(2)}</span>
                      </div>

                      {carrinhoLanches.length > 0 && (
                          <div className="mb-3">
                              <h6 className="text-muted border-bottom pb-1">Lanches:</h6>
                              {carrinhoLanches.map(item => (
                                  <div key={item.id} className="d-flex justify-content-between small">
                                      <span>{item.quantidade}x {item.nome}</span>
                                      <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                                  </div>
                              ))}
                          </div>
                      )}

                      <hr />
                      <div className="d-flex justify-content-between fs-4 fw-bold mb-4 text-success">
                          <span>Total</span>
                          <span>
                            R$ <input {...register("valorTotal")} readOnly 
                                style={{border: 'none', background:'transparent', width: '120px', textAlign:'right', fontWeight:'bold', color: '#198754'}} />
                          </span>
                      </div>
                      <button type="submit" form="formVenda" className="btn btn-success btn-lg w-100">
                          <i className="bi bi-check-circle-fill me-2"></i> Finalizar Compra
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
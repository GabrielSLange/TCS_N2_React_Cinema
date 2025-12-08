export interface Filme {
    id: string;
    titulo: string;
    genero: string;
    descricao: string;
    classificacao: string;
    duracao: number;
    estreia?: string;
}

export interface Sala {
    id: string;
    nome: string;
    capacidade: number;
    tipo: '2D' | '3D' | 'IMAX';
}

export interface Sessao {
    id: string;
    filmeId: string;
    salaId: string;
    dataHora: string;
    preco: number;
    idioma: 'Dublado' | 'Legendado';
    formato: '2D' | '3D';
}

export interface Ingresso {
    id: string;
    sessaoId: string;
    cliente: string;
    cpf: string;
    tipo: 'Inteira' | 'Meia';
    valorPago: number;
}

export interface LancheCombo {
    id: string;
    nome: string;
    preco: number;
    tipo: string;
}

export interface ItemLancheSelecionado extends LancheCombo {
    quantidade: number;
}

export interface Pedido {
    id: string;
    sessaoId: string;
    cliente: string;
    cpf: string;
    assento: string;
    tipoIngresso: 'Inteira' | 'Meia';
    valorIngresso: number;
    itensLanche: ItemLancheSelecionado[];
    valorTotal: number;
    dataPedido: string;
}
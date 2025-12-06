# CineWeb - Sistema de Gestão de Cinema (React + TypeScript)

Projeto desenvolvido como atividade prática acadêmica para a disciplina de Desenvolvimento Web Frontend. O objetivo foi migrar um sistema legado (HTML/JS) para uma arquitetura moderna Single Page Application (SPA) utilizando React, TypeScript e validações robustas.

## 🚀 Tecnologias Utilizadas

O projeto segue estritamente a stack definida nos requisitos:

- **Core:** React + Vite
- **Linguagem:** TypeScript
- **Estilização:** Bootstrap 5 + Bootstrap Icons
- **Roteamento:** React Router DOM (SPA)
- **Validação:** Zod + React Hook Form
- **Backend Simulado:** Json-Server (API REST)

## 📋 Funcionalidades

### 🏠 Área Pública (Landing Page)
- Visualização visual (Cards) de filmes em cartaz.
- Atalhos rápidos para horários de sessões futuras.
- Redirecionamento direto para a venda de ingressos.

### ⚙️ Área Administrativa
Acessível via menu "Administração" na Navbar:

1.  **Módulo de Filmes**
    - Listagem e Cadastro de filmes.
    - Validação de regras de negócio (ex: Duração positiva, Sinopse mínima).
    
2.  **Módulo de Salas**
    - Cadastro de salas com capacidade e tipo (2D, 3D, IMAX).

3.  **Módulo de Sessões**
    - Agendamento cruzando dados de **Filmes** e **Salas**.
    - **Validações Críticas:**
        - Não permite datas retroativas (passado).
        - Não permite agendar sessão antes da data de estreia do filme.

4.  **Venda de Ingressos**
    - Fluxo de venda vinculado a uma sessão específica.
    - Cálculo automático de valor (Inteira vs. Meia Entrada).
    - Registro de dados do cliente (Nome, CPF, Assento).

## 📦 Instalação e Execução

Para o sistema funcionar, é necessário rodar o **Frontend** e a **API Simulada** simultaneamente em terminais separados.

### 1. Instalar dependências
No diretório raiz do projeto:
```bash
npm install
```

### 2. Iniciar o Backend (Terminal 1)
O `json-server` servirá os dados do arquivo `db.json` na porta 3000.
```bash
npx json-server db.json --port 3000
```

### 3. Iniciar o Frontend (Terminal 2)
O Vite subirá a aplicação React.
```bash
npm run dev
```

Após iniciar, acesse o link mostrado no terminal (geralmente `http://localhost:5173`).

## 📂 Estrutura de Arquivos

- **src/pages/**: Componentes das páginas (Home, Filmes, Salas, Sessões, Vendas).
- **src/types.ts**: Interfaces TypeScript para tipagem forte dos dados.
- **db.json**: Banco de dados JSON simulando a persistência.
- **src/App.tsx**: Configuração das Rotas e Layout base (Navbar).

---
*Desenvolvido por Gabriel Sousa Lange- 2025*

# Projeto Alumni - Backend

Sistema de gerenciamento de ex-alunos da FATEC Sorocaba desenvolvido como Trabalho de Conclusão de Curso (TCC).

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração e Instalação](#configuração-e-instalação)
- [Comandos de Desenvolvimento](#comandos-de-desenvolvimento)
- [Funcionalidades](#funcionalidades)
- [Autores](#autores)

## Sobre o Projeto

O Sistema Alumni FATEC Sorocaba é um projeto desenvolvido como Trabalho de Conclusão de Curso pelos alunos [Leonardo Silva](https://linkedin.com/in/leonardo-silva), [Gabriel Bellato](https://linkedin.com/in/gabriel-bellato) e [Nicolas Ferro](https://linkedin.com/in/nicolas-ferro), sob orientação do Professor Nelson Rampim e da Professora Denilce de Almeida.

O objetivo é criar uma plataforma para conectar alunos e ex-alunos da FATEC Sorocaba, facilitando o networking, oportunidades de carreira e manutenção do vínculo com a instituição.

## Tecnologias Utilizadas

- **[NodeJS 22.19.0](https://nodejs.org/pt)** - Ambiente que executa código JavaScript no servidor
- **[Prisma/Prisma Client 6.17.0](https://www.prisma.io/)** - ORM que conecta a aplicação ao banco de dados de forma simples e segura
- **[Express 5.1.0](https://expressjs.com/)** - Framework leve para criar APIs e servidores com Node.js
- **[Nodemailer 7.0.9](https://nodemailer.com/)** - Biblioteca para envio de e-mails pelo servidor
- **[MongoDB](https://www.mongodb.com/)** - Banco de dados não-relacional

## Estrutura do Projeto

```
Alumni-backend/
├── prisma/
│ └── schema.prisma # Definição do schema do Prisma (modelos e datasource)
│
├── src/
│ ├── controllers/
│ │ └── *.js # Controladores responsáveis pela lógica das rotas
│ │
│ ├── middlewares/
│ │ └── authMiddleware.js # Middleware de autenticação JWT
│ │
│ ├── routes/
│ │ └── *.js # Definição das rotas relacionadas a cada arquivo
│ │
│ └── services/
│ └── *.js # Camada de serviço para regras de negócio de cada modelo
│
├── package-lock.json # Controle de versões exatas das dependências
├── package.json # Dependências, scripts e metadados do projeto
├── README.md # Documentação do projeto
└── server.js # Ponto de entrada do servidor Express
```

## Configuração e Instalação

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** (vem com o Node.js)

### Passos para Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/AllumniFatec/Alumni-backend
   cd alumni-backend
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   npx prisma generate
   npx prisma db pull
   ```

3. **Arquivo .env (variáveis de ambiente):**

   ```bash
   DATABASE_URL= "<link de conexão com o seu banco MongoDB>"
   JWT_SECRET = "<sequencia de caracteres para segredo do token>"
   EMAIL_USER= <email de sua cotna gmail (para SMTP Gmail)>
   EMAIL_PASSWORD= <senha gmail para APPs (não é a senha do Gmail)>
   EMAIL_HOST= <host do servidor SMTP> (smtp.gmail.com - SMTP Gmail)
   EMAIL_PORT= <porta para do servidor SMTP>
   ```

4. **Inicie o servidor de desenvolvimento:**

   ```bash
   node server.js, node --watch server.js ou npm run dev (nodemon)
   ```

5. **Acesse a aplicação:**
   ```bash
   Instale a extensão ThunderClient no seu VSCode
   Crie uma nova requisição HTTP do mesmo tipo da rota
   Digite http://localhost:3000/rota no campo de rota
   Preencha o Body e/ou Cookies access_token={token} dependendo da rota
   Envie a requisição e espere a resposta
   ```

## Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar o servidor em modo de desenvolvimento (com nodemon - opcional)
npm run dev

# Iniciar o servidor em produção
npm start

# Gerar o cliente do Prisma (após alterar o schema)
npx prisma generate

# Aplicar alterações no banco de dados
npx prisma db push

# Visualizar o banco de dados com Prisma Studio
npx prisma studio

# Atualizar dependências (opcional)
npm update
```

## Funcionalidades

### Implementadas

- ✅ Rotas CRUD de usuários
- ✅ Criptografia de senha
- ✅ Geração de token JWT para autenticação de usuário
- ✅ Models de usuário

### Em Desenvolvimento

- 🔄 Models gerais do sistema
- 🔄 Rotas gerais do sistema
- 🔄 Autenticação geral do sistema

## Autores

Desenvolvido como Trabalho de Conclusão de Curso na FATEC Sorocaba.

**Desenvolvedores:**

- [Leonardo Silva](https://linkedin.com/in/leonardo-silva)
- [Gabriel Bellato](https://linkedin.com/in/gabriel-bellato)
- [Nicolas Ferro](https://www.linkedin.com/in/nicolas-alexandrino-ferro?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)

**Orientador:**

- Professor Nelson Rampim Filho
- Professora Denilce de Almeida Oliveira Veloso

**Instituição:**

- [FATEC Sorocaba](https://fatecsorocaba.cps.sp.gov.br/)

---

# Alumni Project - Backend

Management system for FATEC Sorocaba alumni, developed as a Final Graduation Project (TCC).

## Table of Contents

- [About the Project](#about-the-project)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Development Commands](#development-commands)
- [Features](#features)
- [Authors](#authors)

## About the Project

The **Alumni FATEC Sorocaba System** is a project developed as a Final Graduation Project by students [Leonardo Silva](https://linkedin.com/in/leonardo-silva), [Gabriel Bellato](https://linkedin.com/in/gabriel-bellato), and [Nicolas Ferro](https://linkedin.com/in/nicolas-ferro), under the supervision of Professor Nelson and Professor Denilce.

The goal is to create a platform that connects current and former FATEC Sorocaba students, facilitating networking, career opportunities, and ongoing engagement with the institution.

## Technologies Used

- **[NodeJS 22.19.0](https://nodejs.org/en)** – Runtime environment for executing JavaScript on the server
- **[Prisma / Prisma Client 6.17.0](https://www.prisma.io/)** – ORM that connects the application to the database easily and securely
- **[Express 5.1.0](https://expressjs.com/)** – Lightweight framework for building APIs and servers with Node.js
- **[Nodemailer 7.0.9](https://nodemailer.com/)** – Library for sending emails from the server
- **[MongoDB](https://www.mongodb.com/)** – Non-relational database

## Project Structure

```
Alumni-backend/
├── prisma/
│   └── schema.prisma              # Prisma schema definition (models and datasource)
│
├── src/
│   ├── controllers/
│   │   └── userController.js      # Controllers that handle user route logic
│   │
│   ├── middlewares/
│   │   └── authMiddleware.js      # JWT authentication middleware
│   │
│   ├── routes/
│   │   └── userRoutes.js          # User-related routes definition
│   │
│   └── services/
│       └── userService.js         # Business logic layer for user operations
│
├── package-lock.json              # Exact version control of dependencies
├── package.json                   # Dependencies, scripts, and project metadata
├── README.md                      # Project documentation
└── server.js                      # Express server entry point
```

## Setup and Installation

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)

### Installation Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AllumniFatec/Alumni-backend
   cd alumni-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **.env file (enviroment variables):**

   ```bash
   DATABASE_URL= "<connection link to your MongoDB database>"
   JWT_SECRET= "<string used as the token secret>"
   EMAIL_USER= <your Gmail account email (for Gmail SMTP)>
   EMAIL_PASSWORD= <Gmail app password (not your Gmail login password)>
   EMAIL_HOST= <SMTP server host> (smtp.gmail.com for Gmail SMTP)
   EMAIL_PORT= <SMTP server port>
   ```

4. **Start the development server:**

   ```bash
   node server.js, node --watch server.js or npm run dev (nodemon)
   ```

5. **Access the application:**

   ```bash
   Install the ThunderClient extension in VSCode.
   Create a new HTTP request matching the route method.
   Enter http://localhost:3000/route in the request URL field.
   Fill in the Body and/or Cookies access_token{token} depending on the route.
   Send the request and wait for the response.
   ```

## Development Commands

```bash
# Install dependencies
npm install

# Start the server in development mode (with nodemon - optional)
npm run dev

# Start the server in production mode
npm start

# Generate Prisma client (after editing the schema)
npx prisma generate

# Apply database changes
npx prisma db push

# Open Prisma Studio to view and edit data
npx prisma studio

# Update dependencies (optional)
npm update
```

## Features

### Implemented

- ✅ User CRUD routes
- ✅ Password encryption
- ✅ JWT token generation for user authentication
- ✅ User model

### In Development

- 🔄 General system models
- 🔄 General system routes
- 🔄 General system authentication

## Authors

Developed as a Final Graduation Project at FATEC Sorocaba.

**Developers:**

- [Leonardo Silva](https://linkedin.com/in/leonardo-silva)
- [Gabriel Bellato](https://linkedin.com/in/gabriel-bellato)
- [Nicolas Ferro](https://www.linkedin.com/in/nicolas-alexandrino-ferro?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)

**Supervisor:**

- Professor Nelson Rampim Filho
- Professor Denilce de Almeida Oliveira Veloso

**Institution:**

- [FATEC Sorocaba](https://fatecsorocaba.cps.sp.gov.br/)

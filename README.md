# barber-shop-API
🧔 Barber Shop API

API REST para gerenciamento de uma barbearia — cadastro de usuários, barbearias, serviços e agendamentos. Fornece endpoints para operações CRUD, autenticação e organização de horários.

🔍 Visão Geral

Este projeto implementa uma API backend para uma barbearia com foco em:

Cadastro e autenticação de usuários

Gestão de barbeiros e serviços

Agendamento de horários de atendimento

Lógica de negócio para disponibilidade de horários

Essa API foi desenvolvida em TypeScript + Node.js + Express, com estrutura modular e boas práticas de desenvolvimento.

🚀 Tecnologias

Este projeto usa as seguintes tecnologias:

TypeScript

Node.js

Express

PostgreSQL (ou outro banco relacional)

ORM (ex: TypeORM / Prisma) (conforme configuração do projeto)

Validações e middlewares

JWT para autenticação


📌 Estrutura do Projeto

Organização típica:

src/
├── controllers/     # Controllers de rotas
├── services/        # Lógica de negócio
├── routes/          # Arquivo de registro de rotas
├── middlewares/     # Middlewares (autenticação, validação)
├── models/          # Entidades / schemas do ORM
├── database/        # Scripts de conexão / migrations
├── utils/           # Funções utilitárias
├── app.ts / server.ts # Entrada da aplicação

📡 Endpoints Principais (Exemplo)


Autenticação
Método	Rota	Descrição
POST	/register	Criar novo usuário
POST	/login	Login e geração de token
Usuários
Método	Rota	Descrição
GET	/users	Lista todos usuários
GET	/users/:id	Obter usuário por ID
PATCH	/users/:id	Atualizar dados do usuário
DELETE	/users/:id	Remover usuário
Barbeiros / Serviços
Método	Rota	Descrição
GET	/barbers	Lista barbeiros
POST	/barbers	Criar barbeiro
GET	/barbers/:id	Detalhes de barbeiro
PATCH	/barbers/:id	Atualizar barbeiro
DELETE	/barbers/:id	Remover barbeiro
Agendamentos
Método	Rota	Descrição
POST	/appointments	Criar agendamento
GET	/appointments	Listar agendamentos
GET	/appointments/:id	Obter agendamento por ID
PATCH	/appointments/:id	Atualizar agendamento
DELETE	/appointments/:id	Cancelar agendamento
🛡️ Autenticação

Este projeto usa JWT (JSON Web Tokens) para autenticação. Tokens são gerados no login e usados para proteger rotas privadas.

Exemplo de Header de Requisição
Authorization: Bearer <seu_token_aqui>


⚖️ Licença

Este projeto é open-source sob a licença MIT.

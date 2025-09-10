# Projeto Plantech - Teste Prático Full Stack

Este projeto consiste em uma aplicação web completa (Back-end e Front-end) para um sistema de Gestão de Entidades (Plantas), desenvolvido para um teste prático de emprego. A aplicação contempla autenticação de usuários, controle de permissões por nível de acesso (usuário comum e administrador) e operações completas de CRUD.

O objetivo deste exercício é demonstrar a capacidade de projetar, desenvolver e entregar uma aplicação funcional, utilizando boas práticas de arquitetura, código limpo e tecnologias modernas.

---

## 🚀 Tecnologias Utilizadas

### Back-end
* **Linguagem:** Java 24
* **Framework:** Spring Boot 3.5.5
* **Segurança:** Spring Security com autenticação e autorização via JWT.
* **Banco de Dados:** PostgreSQL (utilizando Supabase como provedor cloud).
* **Persistência:** Spring Data JPA / Hibernate.
* **Conteinerização:** Docker, Kubernetes (via manifestos YAML).

### Front-end
* **Framework:** Angular 17+
* **Linguagem:** TypeScript
* **Comunicação:** HttpClient para consumo de API REST.
* **Gerência de Estado:** Serviços e Route Guards para controle de autenticação e permissões.

### Ferramentas
* **Build:** Maven (Back-end), Angular CLI (Front-end)

---

## ⚙️ Como Executar o Projeto Completo

É necessário executar o Back-end e o Front-end separadamente, em terminais diferentes.

### Pré-requisitos
* Git instalado.
* Java JDK 24+.
* Node.js e npm instalados.
* Angular CLI instalado (`npm install -g @angular/cli`).
* Uma conta gratuita no [Supabase](https://supabase.com/) para criar o banco de dados PostgreSQL.

### 1. Clonar o Repositório
```bash
git clone [https://github.com/Tap234/Plantech.git]
cd Plantech

2. Configurar Variáveis de Ambiente do Back-end
Crie um arquivo chamado .env na pasta do back-end (ex: /demo/.env) e preencha com suas credenciais do Supabase.

DB_URL=jdbc:postgresql://<SEU_HOST>:<PORTA>/postgres
DB_USER=postgres
DB_PASS=<SUA_SENHA_DO_BANCO>
JWT_SECRET=c3VwZXItc2VjcmV0LWZvci1wbGFudGVjaC1hcHAtMjAyNS1sb25nLWFuZC1zdHJvbmc=

3. Executar o Back-end
Abra um terminal na pasta do back-end (/demo). Recomenda-se usar o perfil de execução do VS Code (launch.json) configurado com o envFile para carregar as variáveis de ambiente.

./mvnw.cmd spring-boot:run
O servidor back-end iniciará na porta 8080.

4. Executar o Front-end
Abra um novo terminal na pasta do front-end (/plantech-frontend).

Primeiro, instale as dependências:

npm install

Depois, inicie o servidor de desenvolvimento:

ng serve
A aplicação front-end estará acessível em http://localhost:4200.

Métodos Alternativos de Execução do Back-end (Docker & Kubernetes)
As instruções abaixo são para executar apenas o back-end de forma conteinerizada. O front-end ainda deve ser executado localmente com ng serve.

Método 2: Execução com Docker
Requisitos Adicionais: Docker Desktop instalado e em execução.

1. Construa a Imagem Docker:
Na raiz do projeto (/Plantech), execute o comando:

docker build -t plantech-backend .

2. Execute o Contêiner:
Este comando iniciará o back-end e injetará as variáveis de ambiente do seu arquivo .env (certifique-se de que o arquivo .env está na mesma pasta onde você executa o comando).

docker run -p 8080:8080 --env-file ./demo/.env plantech-backend
O back-end estará acessível em http://localhost:8080.

Método 3: Execução com Kubernetes
Requisitos Adicionais: Um cluster Kubernetes local (ex: habilitado no Docker Desktop ou via Minikube).

1. Construa a Imagem Docker Local:
Siga o passo 1 do método com Docker para garantir que a imagem plantech-backend:latest exista na sua máquina.

2. Aplique os Manifestos:
Na raiz do projeto (/Plantech), execute o comando:

kubectl apply -f k8s/
Isso criará o Deployment e o Service. Lembre-se de que o deployment.yaml pode precisar ser atualizado com suas credenciais do banco de dados, caso não queira usar variáveis de ambiente.

Usuários de Exemplo para Teste
Ao iniciar o back-end com um banco de dados vazio, o sistema criará automaticamente dois usuários para facilitar os testes (via DataSeeder.java). As credenciais são:

Usuário Administrador:

    Email: admin@email.com

    Senha: senhaadmin

Usuário Comum:

    Email: user@email.com

    Senha: senha123

Endpoints da API
A API do back-end expõe os seguintes endpoints principais:

Autenticação (/api/auth)
POST /register: Cria um novo usuário (com ROLE_USER).

POST /login: Autentica um usuário e retorna um token JWT.

Plantas (/api/plantas) - Requer Autenticação
GET /: Lista todas as plantas do usuário autenticado.

GET /{id}: Busca uma planta específica pelo ID.

POST /: Cria uma nova planta para o usuário autenticado.

PUT /{id}: Atualiza uma planta existente.

DELETE /{id}: Deleta uma planta.

Admin (/api/admin) - Requer Autenticação e Role de ADMIN
GET /users: Lista todos os usuários do sistema.

DELETE /users/{id}: Deleta um usuário e todas as suas plantas associadas.

PUT /users/{id}/promote: Promove um usuário para ROLE_ADMIN.

PUT /users/{id}/demote: Rebaixa um usuário para ROLE_USER.

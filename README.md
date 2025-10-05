# Projeto Plantech

Este projeto consiste em uma aplicação para um sistema de Gestão de Entidades (Plantas). A aplicação contempla autenticação de usuários, controle de permissões por nível de acesso (usuário comum e administrador) e operações completas de CRUD.

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

## ⚙️ Como Executar o Projeto Completo

É necessário executar o Back-end e realizar testes com Postman.

### Pré-requisitos
* Git instalado.
* Java JDK 24+.
* Uma conta gratuita no [Supabase](https://supabase.com/) para criar o banco de dados PostgreSQL.

### 1. Clonar o Repositório
```bash
git clone [https://github.com/Tap234/Plantech_Aplicativo.git]
cd Plantech_Aplicativo

2. Configurar Variáveis de Ambiente do Back-end

    Crie um arquivo chamado .env na pasta do back-end (/demo/.env) e preencha com suas credenciais do Supabase.

    DB_URL=jdbc:postgresql://<SEU_HOST>:<PORTA>/postgres
    DB_USER=<SEU_USUARIO_DO_BANCO>
    DB_PASS=<SUA_SENHA_DO_BANCO>
    JWT_SECRET=c3VwZXItc2VjcmV0LWZvci1wbGFudGVjaC1hcHAtMjAyNS1sb25nLWFuZC1zdHJvbmc=

npm install
ng serve
3. Executar o Back-end (Terminal 2)
Escolha um dos métodos abaixo. Docker é o mais recomendado para um teste rápido.

Método de Execução 1 (Preferencial): Docker & Kubernetes
Via Docker
    1. Construa a Imagem Docker:
    Na raiz do projeto (/Plantech), execute o comando:

    docker build -t plantech-backend .

    2. Execute o Contêiner:
    Este comando iniciará o back-end, injetando as variáveis de ambiente do seu arquivo .env.

    docker run -p 8080:8080 --env-file ./demo/.env plantech-backend
    O back-end estará acessível em http://localhost:8080.

Via Kubernetes
    1. Construa a Imagem Docker Local:
    Siga o passo 1 do método com Docker para garantir que a imagem plantech-backend:latest exista na sua máquina.

    2. Crie o Secret do Kubernetes (IMPORTANTE):
    Execute o comando abaixo para criar um "cofre" seguro com as credenciais do banco de dados. Substitua os valores de placeholder com suas credenciais reais do Supabase.

    kubectl create secret generic db-credentials --from-literal=DB_URL='jdbc:postgresql://<SEU_HOST>:<PORTA>/postgres' --from-literal=DB_USER='<SEU_USUARIO_DO_BANCO>' --from-literal=DB_PASS='<SUA_SENHA_DO_BANCO>'

    3. Aplique os Manifestos:
    Na raiz do projeto (/Plantech), execute o comando:

    kubectl apply -f k8s/
    Isso criará o Deployment e o Service. O deployment.yaml já está configurado para ler as credenciais a partir do Secret.

Método de Execução 2 (Alternativo): Localmente via Maven
    1. Inicie a Aplicação:
    No mesmo terminal onde você executou o script acima, inicie a aplicação.

    ./mvnw.cmd spring-boot:run
    O servidor back-end iniciará na porta 8080.

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

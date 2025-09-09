# Projeto Plantech - Teste Prático de Backend

Este projeto consiste em uma API REST desenvolvida em Java com Spring Boot para um sistema simples de Gestão de Entidades. A aplicação contempla autenticação de usuários, controle de permissões por nível de acesso (usuário comum e administrador) e operações básicas de CRUD.

O objetivo deste exercício é avaliar a capacidade de entrega de uma aplicação funcional, a clareza no código, a atenção aos detalhes de arquitetura e a implementação de boas práticas.

---

## 🚀 Tecnologias Utilizadas

### Back-end
* **Linguagem:** Java 24
* **Framework:** Spring Boot 3.5.5
* **Segurança:** Spring Security com autenticação e autorização via JWT.
* **Banco de Dados:** PostgreSQL (utilizando Supabase como provedor cloud).
* **Persistência:** Spring Data JPA / Hibernate.
* **Conteinerização:** Docker, Kubernetes (via manifestos YAML).

### Ferramentas
* **Build:** Maven
* **Testes de API:** Postman

---

## ⚙️ Como Configurar e Executar o Projeto

Existem três métodos para executar esta aplicação: Localmente, via Docker ou via Kubernetes. Para todos os métodos, os seguintes pré-requisitos são necessários.

### Pré-requisitos
* Git instalado.
* Uma conta gratuita no [Supabase](https://supabase.com/) para criar o banco de dados PostgreSQL.

### 1. Clonar o Repositório
```bash
git clone [https://github.com/Tap234/Plantech.git]
2. Configurar Variáveis de Ambiente
Crie um arquivo chamado .env na raiz do projeto (/Plantech/demo) e preencha com suas credenciais do Supabase, que você pode obter em Project Settings > Database > Connection string.
# Variáveis do Banco de Dados (copie do Supabase)
DB_URL=jdbc:postgresql://<SEU_HOST>:<PORTA>/postgres
DB_USER=postgres
DB_PASS=<SUA_SENHA_DO_BANCO>

# Chave Secreta para JWT
JWT_SECRET=c3VwZXItc2VjcmV0LWZvci1wbGFudGVjaC1hcHAtMjAyNS1sb25nLWFuZC1zdHJvbmc=

Método 1: Execução Local
Requisitos Adicionais: Java JDK 24.

Na raiz do projeto (/Plantech), execute o seguinte comando no terminal. O servidor iniciará na porta 8080.
# Navegue até a pasta do módulo Maven
cd demo
# Execute usando o Maven Wrapper
.\mvnw.cmd spring-boot:run

Método 2: Execução com Docker (Recomendado para Teste)
Requisitos Adicionais: Docker Desktop instalado e em execução.

Construa a Imagem Docker: Na raiz do projeto (/Plantech), execute o comando:
docker build -t plantech-backend .

Execute o Contêiner: Este comando iniciará a aplicação e injetará as variáveis de ambiente do seu arquivo .env.
docker run -p 8080:8080 --env-file .env plantech-backend
A aplicação estará acessível em http://localhost:8080

Método 3: Execução com Kubernetes
Requisitos Adicionais: Um cluster Kubernetes local (ex: habilitado no Docker Desktop ou via Minikube).

Construa a Imagem Docker Local: Siga o passo 1 do método com Docker para garantir que a imagem plantech-backend:latest exista na sua máquina.

Atualize o Manifesto: Abra o arquivo k8s/deployment.yaml e substitua os valores de placeholder (<SEU_HOST>, etc.) pelas suas credenciais do Supabase.

Aplique os Manifestos: Na raiz do projeto (/Plantech), execute o comando:
kubectl apply -f k8s/
Isso criará o Deployment e o Service.

Acesse a Aplicação: Para encontrar o endereço de acesso, execute kubectl get services e procure pelo EXTERNAL-IP do plantech-backend-service.

Usuários de Exemplo para Teste
Ao iniciar a aplicação pela primeira vez com um banco de dados vazio (usando qualquer um dos métodos de execução), o sistema criará automaticamente dois usuários para facilitar os testes. As credenciais são:

Usuário Administrador:

Email: admin@email.com

Senha: senhaadmin

Usuário Comum:

Email: user@email.com

Senha: senha123
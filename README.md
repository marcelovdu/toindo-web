# TôIndo 🚀

![Status do Projeto](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

**TôIndo** é a solução definitiva para transformar planos casuais em eventos memoráveis. Chega de organizar encontros em grupos de mensagens fragmentados e confusos! Nossa plataforma oferece um espaço centralizado, elegante e eficiente para criar, descobrir e gerenciar eventos sociais de todos os tipos — desde um churrasco no fim de semana, um luau na praia, até uma partida de vôlei ou um clube do livro.

O objetivo do TôIndo é simples: conectar pessoas e facilitar a organização de momentos que realmente importam, transformando ideias em encontros reais de forma prática e agradável.

---

## ✨ Funcionalidades Principais

* 🔐 **Autenticação Segura com NextAuth.js:** Gerenciamento completo de usuários (login, cadastro e logout) utilizando provedores OAuth, garantindo uma experiência segura e fluida.

* 📅 **Gerenciamento Completo de Eventos (CRUD):** Controle total sobre o ciclo de vida dos eventos.
    * **Criar Eventos:** Interface simples para que os usuários possam criar novos eventos com todos os detalhes necessários.
    * **Visualizar Eventos:** Explore todos os eventos disponíveis em uma interface limpa e organizada.
    * **Atualizar Eventos:** Permite que os organizadores modifiquem as informações de seus eventos a qualquer momento.
    * **Deletar Eventos:** Funcionalidade para remover eventos que não irão mais acontecer.

* 📄 **Página de Detalhes do Evento:** Cada evento possui uma página dedicada, com um design limpo, visual agradável e totalmente *user-friendly*, apresentando todas as informações de forma clara e organizada.

* 🔍 **Busca e Filtragem Avançada:** Um sistema de busca robusto que permite aos usuários encontrar facilmente os eventos que mais lhe interessam.

* 🗂️ **Meus Eventos Organizados:** Uma área dedicada para que o usuário visualize e gerencie de forma prática todos os eventos que criou.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com um conjunto de tecnologias modernas e poderosas para garantir a melhor performance e escalabilidade.

* Next.js
* TypeScript
* Tailwind CSS
* Shadcn/ui
* React Hook Form
* Node.js
* MongoDB
* Mongoose
* NextAuth.js
* Zod

---

## 🛠️ Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e executar o projeto na sua máquina.

### Pré-requisitos

* [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
* [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
* Uma connection string do [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) ou uma instância local do MongoDB.

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/marcelovdu/toindo-web.git](https://github.com/marcelovdu/toindo-web.git)
    ```

2.  **Acesse a pasta do projeto:**
    ```bash
    cd toindo-web
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    # yarn install
    ```

4.  **Configure as variáveis de ambiente:**
    * Crie uma cópia do arquivo `.env.example` (se houver um) ou crie um novo arquivo chamado `.env.local` na raiz do projeto.
    * Adicione as seguintes variáveis:

    ```env
    # String de conexão com seu banco de dados MongoDB
    MONGODB_URI=SUA_CONNECTION_STRING_DO_MONGODB

    # Chave secreta para o NextAuth.js
    # Você pode gerar uma usando: openssl rand -base64 32
    NEXTAUTH_SECRET=SUA_CHAVE_SECRETA_AQUI
    NEXTAUTH_URL=http://localhost:3000

    # Credenciais OAuth (exemplo com Google)
    GOOGLE_CLIENT_ID=SEU_CLIENT_ID_DO_GOOGLE
    GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET_DO_GOOGLE
    ```

5.  **Rode a aplicação em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```

6.  **Abra o navegador** e acesse `http://localhost:3000` para ver a aplicação funcionando!

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
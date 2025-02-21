# 🌐 **Social Network API**

🚀 *API backend para uma plataforma de rede social moderna, fornecendo autenticação de usuários, manipulação de postagens, chats em tempo real, e muito mais.*

---

## 📜 **Funcionalidades**

✅ **Autenticação de Usuário:** Cadastro, login e autenticação segura com **JWT**.  
✅ **Gestão de Usuários:** Criação, atualização, exclusão e consulta de usuários.  
✅ **Postagens:** Criação, leitura e exclusão de postagens.  
✅ **Mensagens:** Envio e recebimento de mensagens em tempo real.  
✅ **Verificação de E-mail:** Envio de e-mail para validação de novos usuários.

---

### 🚧 **Funcionalidades em Construção**

🔹 **Feed de Postagens:** Funcionalidade do feed ainda está em construção.  
🔹 **Perfil de Usuário:** A página de perfil, incluindo dados e configurações, ainda está em desenvolvimento.  
🔹 **Chat em Tempo Real:** Sistema de chat em tempo real em processo de implementação.  
🔹 **Postagens com Imagens:** A funcionalidade de adicionar imagens nas postagens está sendo trabalhada.  
🔹 **Foto de Perfil:** A funcionalidade para upload e gestão de foto de perfil ainda está em desenvolvimento.  
🔹 **Fotos em Postagens:** A adição de fotos nas postagens está sendo construída.

---

## 🛠 **Tecnologias Usadas**

🚀 **Node.js**: Ambiente de execução JavaScript para a construção do backend.  
🚀 **Express.js**: Framework minimalista para o gerenciamento de rotas e API.  
🚀 **MongoDB**: Banco de dados NoSQL utilizado para persistir dados dos usuários e postagens.  
🚀 **Mongoose**: ODM para MongoDB, fornecendo abstrações simples para interagir com o banco de dados.  
🚀 **JWT**: Utilizado para autenticação segura, gerando tokens de acesso para usuários logados.  
🚀 **bcryptjs**: Utilizado para hash de senhas dos usuários.  
🚀 **node-cron**: Utilizado para tarefas programadas, como a limpeza de usuários não verificados após um tempo.  
🚀 **Nodemailer**: Para envio de e-mails (por exemplo, verificação de e-mail de cadastro).

---

## 💻 **Endpoints da API**

### 📍 **Autenticação**

🔹 `POST /api/auth/register` - Cadastrar um novo usuário.  
🔹 `POST /api/auth/login` - Logar um usuário já registrado. Retorna um token JWT.  
🔹 `POST /api/auth/forgot-password` - Envia um e-mail para resetar a senha do usuário.

### 📍 **Usuários**

🔹 `GET /api/user/:id` - Recuperar os dados de um usuário pelo ID.  
🔹 `PUT /api/user/:id` - Atualizar os dados de um usuário pelo ID.  
🔹 `DELETE /api/user/:id` - Deletar um usuário pelo ID.

### 📍 **Postagens**

🔹 `POST /api/post` - Criar uma nova postagem.  
🔹 `GET /api/post/:id` - Recuperar uma postagem pelo ID.  
🔹 `DELETE /api/post/:id` - Deletar uma postagem pelo ID.

### 📍 **Mensagens**

🔹 `POST /api/messenger/send` - Enviar uma mensagem para outro usuário.  
🔹 `GET /api/messenger/:userId` - Recuperar todas as mensagens de um usuário pelo ID.

---

## 📝 **Como Funciona**

🟢 **Cadastro e Login:** A API permite que os usuários se cadastrem, façam login e obtenham um token JWT para autenticação.  
🟢 **Verificação de E-mail:** Após o cadastro, o usuário precisa verificar o e-mail enviado para ativar sua conta.  
🟢 **Gestão de Postagens e Mensagens:** Os usuários podem criar, editar e deletar postagens e enviar mensagens em tempo real.  
🟢 **Limpeza de Usuários Não Verificados:** A API executa um processo em segundo plano para remover usuários que não confirmaram o e-mail após um tempo.

---

## 🔒 **Segurança**

🔹 **JWT (JSON Web Token):** A autenticação de usuários é feita através de tokens JWT, que garantem que apenas usuários autenticados possam acessar rotas protegidas.  
🔹 **Hashing de Senhas:** As senhas são armazenadas de forma segura utilizando **bcryptjs**.  
🔹 **Validação de E-mail:** Envio de token de verificação para garantir que o e-mail de cada usuário é válido.

---

## 📦 **Melhorias Futuras**

💡 **Notificações em Tempo Real:** Adicionar um sistema de notificações push.  
💡 **Filtro de Postagens e Mensagens:** Implementar filtros para busca e filtragem de conteúdo.  
💡 **Suporte a Arquivos:** Permitir o upload de imagens e outros arquivos nas postagens e mensagens.

---

## 📄 **Licença**

Este projeto é licenciado sob a **Licença MIT** - veja o arquivo LICENSE para mais detalhes.

---

## 🙌 **Contribua**

🎉 *Contribuições são bem-vindas!* Se quiser contribuir, faça um **fork** deste repositório, crie uma **branch** e envie um **pull request**.  

🚀 *Junte-se a nós para tornar esta API ainda mais incrível!*

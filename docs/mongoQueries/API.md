# 📚 Alumni Backend API

Documentação oficial da API do sistema **Alumni**.

Esta API fornece funcionalidades para:

- autenticação de usuários
- gerenciamento de cursos
- criação de posts
- comentários
- likes
- feed da aplicação

---

# 🌐 Base URL

```
http://localhost:3001
```

---

# 🔐 Autenticação

A API utiliza **JWT armazenado em Cookie** para autenticação.

Após realizar login, o backend retorna um cookie chamado:

```
access_token
```

Este cookie deve ser enviado automaticamente nas requisições protegidas.

### Header utilizado

```
Cookie: access_token=JWT_TOKEN
```

---

# 📦 Estrutura da API

A API está dividida nos seguintes módulos:

```
Auth
Courses
Feed
Posts
Comments
Likes
Users
```

---

# 🔐 Auth

## POST /auth/register

Realiza o cadastro de um novo usuário.

### Request Body

```json
{
  "name": "Gabriela Martins",
  "email": "gabi@email.com",
  "password": "Teste123@",
  "userType": "Student",
  "course": "Polímeros",
  "gender": "Female",
  "enrollmentYear": 2020
}
```

### Campos

| Campo          | Tipo   | Descrição                              |
| -------------- | ------ | -------------------------------------- |
| name           | string | Nome completo do usuário               |
| email          | string | Email do usuário                       |
| password       | string | Senha da conta                         |
| userType       | string | Tipo de usuário (Student, Alumni, etc) |
| course         | string | Curso do usuário                       |
| gender         | string | Gênero                                 |
| enrollmentYear | number | Ano de matrícula                       |

### Response (201)

```json
{
  "message": "Usuário cadastrado com sucesso!"
}
```

---

## POST /auth/login

Realiza o login do usuário.

### Request Body

```json
{
  "email": "nicolas@email.com",
  "password": "Teste123@"
}
```

### Response (200)

```json
{
  "message": "Login realizado com sucesso"
}
```

### Cookie retornado

```
access_token=JWT_TOKEN
```

---

# 🎓 Courses

## POST /course

Cria um novo curso.

### Request Body

```json
{
  "courseName": "Sistemas Biomédicos",
  "courseAbbreviation": "SB"
}
```

### Campos

| Campo              | Tipo   | Descrição              |
| ------------------ | ------ | ---------------------- |
| courseName         | string | Nome completo do curso |
| courseAbbreviation | string | Sigla do curso         |

### Response (201)

```json
{
  "message": "Curso cadastrado com sucesso!"
}
```

---

# 📰 Feed

## GET /feed

Retorna as informações do feed da aplicação.

O feed contém:

- posts recentes
- usuários recentes
- eventos recentes
- vagas recentes

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Response (200)

```json
{
  "posts": [
    {
      "id": "69a9d4cfb755a17cd7967c72",
      "content": "Teste de post",
      "create_date": "2026-03-05T19:09:03.794Z",
      "user_id": "69a864f5e704caa8ff079520",
      "user_name": "Leonardo Silva",
      "user_perfil_photo": null,
      "user_status": "Active",
      "user_course_abbreviation": "ADS",
      "user_course_enrollmentYear": 2025,
      "comments_count": 1,
      "likes_count": 1,
      "comments": [
        {
          "id": "69adce432cab0f6ac1990e19",
          "content": "Realmente foi muito bacana professor!",
          "create_date": "2026-03-08T19:30:11.657Z",
          "user_id": "69a86bf41cb9a26b750064a4",
          "user_name": "Nicolas Ferro",
          "user_perfil_photo": null,
          "user_status": "Active",
          "user_course_abbreviation": "LOG",
          "user_course_enrollmentYear": 2023
        }
      ],
      "likes": [
        {
          "id": "69adc827d09b66686bd89e2f",
          "create_date": "2026-03-08T19:17:13.499Z",
          "user_id": "69a86bf41cb9a26b750064a4",
          "user_name": "Nicolas Ferro",
          "user_perfil_photo": null,
          "user_status": "Active",
          "user_course_abbreviation": "LOG",
          "user_course_enrollmentYear": 2023
        }
      ]
    },
    {
      "id": "69a9cb13f760e431b54b131e",
      "content": "Hoje tivemos o primeiro dia da semana da tecnologia. O evento foi um sucesso, as paletras foram incríveis e os alunos participaram bastante das palestras, além dos cursos incríveis que tivemos também.\n\nObrigado a todos que participaram!",
      "create_date": "2026-03-05T18:27:31.565Z",
      "user_id": "69a864f5e704caa8ff079520",
      "user_name": "Leonardo Silva",
      "user_perfil_photo": null,
      "user_status": "Active",
      "user_course_abbreviation": "ADS",
      "user_course_enrollmentYear": 2025,
      "comments_count": 0,
      "likes_count": 0,
      "comments": [],
      "likes": []
    },
    {
      "id": "69a9c9e28cab6c8a9e32b538",
      "content": "Hoje tivemos o primeiro dia da semana da tecnologia. O evento foi um sucesso, as paletras foram incríveis e os alunos participaram bastante das palestras, além dos cursos incríveis que tivemos também.",
      "create_date": "2026-03-05T18:22:26.769Z",
      "user_id": "69a864f5e704caa8ff079520",
      "user_name": "Leonardo Silva",
      "user_perfil_photo": null,
      "user_status": "Active",
      "user_course_abbreviation": "ADS",
      "user_course_enrollmentYear": 2025,
      "comments_count": 0,
      "likes_count": 0,
      "comments": [],
      "likes": []
    }
  ],
  "latestUsers": [
    {
      "id": "69ac9668196f7b43bf460352",
      "name": "nicolas",
      "perfil_photo": null,
      "course_name": "Análise e Desenvolvimento de Sistemas",
      "enrollmentYear": 2023
    },
    {
      "id": "69a86c171cb9a26b750064a5",
      "name": "Gabriela Martins",
      "perfil_photo": null,
      "course_name": "Polímeros",
      "enrollmentYear": 2020
    },
    {
      "id": "69a86bf41cb9a26b750064a4",
      "name": "Nicolas Ferro",
      "perfil_photo": null,
      "course_name": "Logística",
      "enrollmentYear": 2023
    },
    {
      "id": "69a864f5e704caa8ff079520",
      "name": "Leonardo Silva",
      "perfil_photo": null,
      "course_name": "Análise e Desenvolvimento de Sistemas",
      "enrollmentYear": 2025
    }
  ],
  "latestEvents": [],
  "latestJobs": []
}
```

---

# 📝 Posts

## POST /post

Cria uma nova postagem.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "content": "Teste de post"
}
```

### Campos

| Campo   | Tipo   | Descrição            |
| ------- | ------ | -------------------- |
| content | string | Conteúdo da postagem |

### Response (201)

```json
{
  "message": "Postagem criada com sucesso!"
}
```

---

## PATCH /post/:postId

Editar o conteúdo de uma postagem.

### Example

```
PATCH /post/69aa02beef85f8d0cb38ca66
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "content": "Editei o post"
}
```

### Parâmetros

| Parâmetro | Tipo   | Descrição      |
| --------- | ------ | -------------- |
| postId    | string | ID da postagem |

### Response (200)

```json
{
  "message": "Postagem atualizada com sucesso!"
}
```

---

## DELETE /post/:postId

Remove uma postagem.

### Example

```
DELETE /post/69aa02beef85f8d0cb38ca66
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Parâmetros

| Parâmetro | Tipo   | Descrição      |
| --------- | ------ | -------------- |
| postId    | string | ID da postagem |

### Response (200)

```json
{
  "message": "Postagem deletada com sucesso!"
}
```

---

# 💬 Comments

## POST /post/comment/:postId

Cria um comentário em uma postagem.

### Example

```
POST /post/comment/69a9cb13f760e431b54b131e
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "content": "Realmente foi muito bacana professor!"
}
```

### Campos

| Campo   | Tipo   | Descrição              |
| ------- | ------ | ---------------------- |
| content | string | Conteúdo do comentário |

### Response (201)

```json
{
  "message": "Comentário adicionado com sucesso!"
}
```

---

## PATCH /post/comment/:commentId

Edita um comentário existente.

### Example

```
PATCH /post/comment/69ab2c3d656641149df3f4d8
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "content": "Editei o comentário"
}
```

### Parâmetros

| Parâmetro | Tipo   | Descrição        |
| --------- | ------ | ---------------- |
| commentId | string | ID do comentário |

### Response (200)

```json
{
  "message": "Comentário atualizado com sucesso!"
}
```

---

## DELETE /post/comment/:commentId

Remove um comentário.

### Example

```
DELETE /post/comment/69ab2c3d656641149df3f4d8
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Response (200)

```json
{
  "message": "Comentário deletado com sucesso!"
}
```

---

# ❤️ Likes

## POST /post/like/:postId

Adiciona um like em uma postagem.

### Example

```
POST /post/like/69a9d4cfb755a17cd7967c72
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Parâmetros

| Parâmetro | Tipo   | Descrição      |
| --------- | ------ | -------------- |
| postId    | string | ID da postagem |

### Response (200)

```json
{
  "message": "Postagem curtida com sucesso!"
}
```

---

## DELETE /post/like/:postId

Remove o like de uma postagem.

### Example

```
DELETE /post/like/69a9d4cfb755a17cd7967c72
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Response (200)

```json
{
  "message": "Curtida removida com sucesso!"
}
```

---

# 📊 Status Codes

| Código | Significado              |
| ------ | ------------------------ |
| 200    | Sucesso                  |
| 201    | Recurso criado           |
| 400    | Requisição inválida      |
| 401    | Não autenticado          |
| 403    | Sem permissão            |
| 404    | Recurso não encontrado   |
| 500    | Erro interno do servidor |

---

# 🚀 Tecnologias Utilizadas

Backend desenvolvido utilizando:

- **Node.js**
- **Express**
- **Prisma ORM**
- **MongoDB**
- **JWT Authentication**

---

# 👨‍💻 Projeto

Sistema desenvolvido para gerenciamento e interação entre **ex-alunos (Alumni)** de instituições de ensino.

Funcionalidades principais:

- cadastro e autenticação de usuários
- criação de posts
- comentários
- likes
- feed de atividades
- gerenciamento de cursos

---

# 📌 Observações

- Algumas rotas exigem autenticação via **JWT Cookie**
- IDs utilizados nas rotas são gerados automaticamente pelo banco de dados
- A API pode evoluir com novos módulos como:

```
Eventos
Vagas de emprego
Perfis de usuário
```

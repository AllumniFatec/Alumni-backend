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

## POST /auth/logout

Realiza o logout do usuário.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Response (200)

```json
{
  "message": "Logout realizado com sucesso!"
}
```

---

## GET /auth/me

Retorna os dados do usuário logado.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Response (200)

```json
{
  "id": "69a864f5e704caa8ff079520",
  "name": "Leonardo Barbosa da Silva",
  "email": "leo@email.com",
  "admin": false,
  "perfil_photo": {
    "url": "https://res.cloudinary.com/alumni-fatecso/image/upload/v1773520519/images/69a864f5e704caa8ff079520_1773520517438.jpg",
    "public_id": "images/69a864f5e704caa8ff079520_1773520517438"
  }
}
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
      "name": "Leonardo Barbosa da Silva",
      "perfil_photo": "https://res.cloudinary.com/alumni-fatecso/image/upload/v1773520519/images/69a864f5e704caa8ff079520_1773520517438.jpg",
      "course_name": "Análise e Desenvolvimento de Sistemas",
      "enrollmentYear": 2025
    }
  ],
  "latestEvents": [
    {
      "id": "69b7056d8affb46c728583e3",
      "title": "Palestra: Carreira em Cibersegurança",
      "local": "Online — Google Meet",
      "date_start": "2026-03-28T19:00:00.000Z"
    },
    {
      "id": "69b7056d8affb46c728583e0",
      "title": "Workshop de Inteligência Artificial na Prática",
      "local": "Fatec Sorocaba — Lab 3",
      "date_start": "2026-04-05T09:00:00.000Z"
    },
    {
      "id": "69b7056d8affb46c728583e1",
      "title": "Alumni Connect — Networking & Mentoria",
      "local": "Fatec Sorocaba — Auditório",
      "date_start": "2026-04-18T14:00:00.000Z"
    },
    {
      "id": "69b7056d8affb46c728583e4",
      "title": "Visita Técnica — Google São Paulo",
      "local": "Google Brasil — São Paulo, SP",
      "date_start": "2026-04-25T10:00:00.000Z"
    },
    {
      "id": "69b7056d8affb46c728583e2",
      "title": "Semana da Computação 2026",
      "local": "Fatec Sorocaba — Campus completo",
      "date_start": "2026-05-11T08:00:00.000Z"
    }
  ],
  "latestJobs": [
    {
      "id": "69bb41c937aeab5317860cc7",
      "title": "dddd",
      "company": "ddddd",
      "city": "Sorocaba",
      "state": "SP",
      "work_model": "OnSite"
    },
    {
      "id": "69bb260844dbded927373944",
      "title": "blablalbalba",
      "company": "Apple",
      "city": "Xique Xique",
      "state": "BA",
      "work_model": "Remote"
    },
    {
      "id": "69b09f3aa6fd5dbeab23474b",
      "title": "Desenvolvedor FullStack JavaScript",
      "company": "Google",
      "city": "Sorocaba",
      "state": "SP",
      "work_model": "OnSite"
    }
  ]
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
| postId  | string | ID da postagem         |
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

| Parâmetro | Tipo   | Descrição              |
| --------- | ------ | ---------------------- |
| commentId | string | ID do comentário       |
| content   | string | Conteúdo do comentário |

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

### Parâmetros

| Parâmetro | Tipo   | Descrição        |
| --------- | ------ | ---------------- |
| commentId | string | ID do comentário |

### Response (200)

```json
{
  "message": "Comentário deletado com sucesso!"
}
```

---

# ❤️ Likes

## POST /post/like/:postId 🆕

Adiciona ou remove um like em uma postagem.

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

OR

{
  "message": "Curtida removida com sucesso!"
}
```

---

# 📢 Jobs

## POST /job 🆕

Cria uma nova vaga de emprego.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "title": "Título da vaga",
  "description": "Descrição da Vaga",
  "city": "Sorocaba",
  "state": "SP",
  "country": "Brasil",
  "employment_type": "CLT",
  "seniority_level": "Senior",
  "work_model": "Remote",
  "workplace_name": "FATEC Sorocaba"
}
```

### Parâmetros

| Parâmetro       | Tipo   | Descrição          |
| --------------- | ------ | ------------------ |
| title           | string | Título da vaga     |
| description     | string | Descrição da vaga  |
| city            | string | Cidade da vaga     |
| state           | string | Estado da vaga     |
| country         | string | País da vaga       |
| employment_type | string | Tipo de trabalho   |
| seniority_level | string | Nível da vaga      |
| work_model      | string | Modelo de trabalho |
| workplace_name  | string | Nome da empresa    |

### Response (201)

```json
{
  "message": "Vaga criada com sucesso!"
}
```

---

## GET /job 🆕

Retorna uma lista com 20 vagas de emprego de acordo com a páginação via query params.

### Example

```
GET /job?page=1
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Response (200)

```json
[
  {
    "id": "69bbfc52b2d03171e1c439ef",
    "title": "BRBRBRBRBRBR",
    "author_id": "69a864f5e704caa8ff079520",
    "workplace": "Fatec Sorocaba",
    "city": "Pirituba",
    "state": "SP",
    "employment_type": "CLT",
    "work_model": "Remote",
    "status": "Active",
    "create_date": "2026-03-19T13:38:26.830Z"
  },
  {
    "id": "69bb41c937aeab5317860cc7",
    "title": "dddd",
    "author_id": "69b59d073dfcbf4d5b46b90f",
    "workplace": "ddddd",
    "city": "Sorocaba",
    "state": "SP",
    "employment_type": "Trainee",
    "work_model": "OnSite",
    "status": "Active",
    "create_date": "2026-03-19T00:22:33.760Z"
  },
  {
    "id": "69bb260844dbded927373944",
    "title": "blablalbalba",
    "author_id": "69a864f5e704caa8ff079520",
    "workplace": "Apple",
    "city": "Xique Xique",
    "state": "BA",
    "employment_type": "CLT",
    "work_model": "Remote",
    "status": "Active",
    "create_date": "2026-03-18T22:24:08.344Z"
  },
  {
    "id": "69b09f3aa6fd5dbeab23474b",
    "title": "Desenvolvedor FullStack JavaScript",
    "author_id": "69a864f5e704caa8ff079520",
    "workplace": "Google",
    "city": "Sorocaba",
    "state": "SP",
    "employment_type": "CLT",
    "work_model": "OnSite",
    "status": "Active",
    "create_date": "2026-03-10T22:46:18.168Z"
  }
]
```

---

## GET /job/:jobId 🆕

Retorna todos os campos de uma vaga de acordo com o ID.

### Example

```
GET /job/69b09f3aa6fd5dbeab23474b
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Parâmetros

| Parâmetro | Tipo   | Descrição  |
| --------- | ------ | ---------- |
| jobId     | string | ID da vaga |

### Response (200)

```json
{
  "id": "69b09f3aa6fd5dbeab23474b",
  "title": "Desenvolvedor FullStack JavaScript",
  "description": "blablablablabla",
  "author_id": "69a864f5e704caa8ff079520",
  "author_name": "Leonardo Barbosa da Silva",
  "author_perfil_photo": {
    "url": "https://res.cloudinary.com/alumni-fatecso/image/upload/v1773520519/images/69a864f5e704caa8ff079520_1773520517438.jpg",
    "public_id": "images/69a864f5e704caa8ff079520_1773520517438"
  },
  "author_workplace": {
    "company": "Google"
  },
  "author_course_abbreviation": "ADS",
  "author_course_enrollmentYear": 2025,
  "workplace": "Google",
  "city": "Sorocaba",
  "state": "SP",
  "country": "Brasil",
  "employment_type": "CLT",
  "work_model": "OnSite",
  "status": "Active",
  "create_date": "2026-03-10T22:46:18.168Z"
}
```

---

## PATCH /job/:jobId 🆕

Edita o conteúdo de uma vaga (somente Admin ou Criador da vaga)

### Example

```
PATCH /job/69bb27ce4cc35d687dffae2d
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "title": "Título editado",
  "description": "Descrição editada",
  "city": "Xique Xique",
  "state": "BA",
  "country": "Brasil",
  "employment_type": "CLT",
  "seniority_level": "Junior",
  "work_model": "OnSite",
  "workplace_name": "FATEC Sorocaba"
}
```

### Parâmetros

| Parâmetro       | Tipo   | Descrição          |
| --------------- | ------ | ------------------ |
| title           | string | Título da vaga     |
| description     | string | Descrição da vaga  |
| city            | string | Cidade da vaga     |
| state           | string | Estado da vaga     |
| country         | string | País da vaga       |
| employment_type | string | Tipo de trabalho   |
| seniority_level | string | Nível da vaga      |
| work_model      | string | Modelo de trabalho |
| workplace_name  | string | Nome da empresa    |

### Response (200)

```json
{
  "message": "Vaga atualizada com sucesso!"
}
```

---

## DELETE /job/:jobId 🆕

Exclui uma vaga de trabalho postada (somente Admin ou Criador da vaga)

### Example

```
DELETE /job/69bb27ce4cc35d687dffae2d
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Parâmetros

| Parâmetro | Tipo   | Descrição  |
| --------- | ------ | ---------- |
| jobId     | string | ID da vaga |

### Response (200)

```json
{
  "message": "Vaga excluída com sucesso!"
}
```

---

# 📅 Events (In Progress)

# 👤 Users

## GET /user 🆕

Retorna uma lista com 40 usuários de acordo com a páginação via query params.

### Example

```
GET /user?page=1
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Response (200)

```json
[
  {
    "user_id": "69a86c171cb9a26b750064a5",
    "name": "Gabriela Martins",
    "courses": [
      {
        "course_name": "Polímeros",
        "enrollmentYear": 2020
      }
    ],
    "perfil_photo": null,
    "user_type": "Student",
    "workplace_history": []
  },
  {
    "user_id": "69a864f5e704caa8ff079520",
    "name": "Leonardo Barbosa da Silva",
    "courses": [
      {
        "course_name": "Análise e Desenvolvimento de Sistemas",
        "enrollmentYear": 2025
      }
    ],
    "perfil_photo": {
      "url": "https://res.cloudinary.com/alumni-fatecso/image/upload/v1773520519/images/69a864f5e704caa8ff079520_1773520517438.jpg",
      "public_id": "images/69a864f5e704caa8ff079520_1773520517438"
    },
    "user_type": "Student",
    "workplace_history": [
      {
        "workplace_user_id": "69b453af6739721bd34e54ff",
        "position": "Gerente de Banco de Dados",
        "function": "Quase todas possíveis",
        "workplace": {
          "company": "Google"
        },
        "start_date": "2026-01-29T03:00:00.000Z",
        "end_date": "2026-02-28T03:00:00.000Z"
      },
      {
        "workplace_user_id": "69b45168826012b4d65a4e23",
        "position": "Desenvolvedor Full-Stack JavaScript",
        "function": "Quase todas possíveis",
        "workplace": {
          "company": "Google"
        },
        "start_date": "2026-01-01T00:00:00.000Z",
        "end_date": null
      },
      {
        "workplace_user_id": "69bb0097c7b407a5f1bad4e8",
        "position": "Engenheiro de Software",
        "function": "Desenvolver novidades para o software IOS",
        "workplace": {
          "company": "Apple"
        },
        "start_date": "2022-03-01T03:00:00.000Z",
        "end_date": "2022-12-31T03:00:00.000Z"
      }
    ]
  },
  {
    "user_id": "69a86bf41cb9a26b750064a4",
    "name": "Nicolas Ferro",
    "courses": [
      {
        "course_name": "Logística",
        "enrollmentYear": 2023
      }
    ],
    "perfil_photo": null,
    "user_type": "Alumni",
    "workplace_history": []
  },
  {
    "user_id": "69ac9668196f7b43bf460352",
    "name": "nicolas",
    "courses": [
      {
        "course_name": "Análise e Desenvolvimento de Sistemas",
        "enrollmentYear": 2023
      }
    ],
    "perfil_photo": null,
    "user_type": "Student",
    "workplace_history": []
  },
  {
    "user_id": "69b59d073dfcbf4d5b46b90f",
    "name": "nicolas",
    "courses": [
      {
        "course_name": "Análise e Desenvolvimento de Sistemas",
        "enrollmentYear": 2023
      }
    ],
    "perfil_photo": null,
    "user_type": "Student",
    "workplace_history": []
  }
]
```

## GET /user/:userId 🆕

Retorna os dados de apenas 1 usuário pelo ID.

### Example

```
GET /user/69a864f5e704caa8ff079520
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Parâmetros

| Parâmetro | Tipo   | Descrição     |
| --------- | ------ | ------------- |
| userId    | string | ID do usuário |

### Response (200)

```json
{
  "user_id": "69a864f5e704caa8ff079520",
  "perfil_photo": {
    "url": "https://res.cloudinary.com/alumni-fatecso/image/upload/v1773520519/images/69a864f5e704caa8ff079520_1773520517438.jpg",
    "public_id": "images/69a864f5e704caa8ff079520_1773520517438"
  },
  "name": "Leonardo Barbosa da Silva",
  "biography": "Estudante da FATEC e desenvolvedor C# na Apple",
  "user_type": "Student",
  "courses": [
    {
      "course_name": "Análise e Desenvolvimento de Sistemas",
      "enrollmentYear": 2025
    }
  ],
  "workplace_history": [
    {
      "workplace_user_id": "69b453af6739721bd34e54ff",
      "position": "Gerente de Banco de Dados",
      "function": "Quase todas possíveis",
      "workplace": {
        "company": "Google"
      },
      "start_date": "2026-01-29T03:00:00.000Z",
      "end_date": "2026-02-28T03:00:00.000Z"
    },
    {
      "workplace_user_id": "69b45168826012b4d65a4e23",
      "position": "Desenvolvedor Full-Stack JavaScript",
      "function": "Quase todas possíveis",
      "workplace": {
        "company": "Google"
      },
      "start_date": "2026-01-01T00:00:00.000Z",
      "end_date": null
    },
    {
      "workplace_user_id": "69bb0097c7b407a5f1bad4e8",
      "position": "Engenheiro de Software",
      "function": "Desenvolver novidades para o software IOS",
      "workplace": {
        "company": "Apple"
      },
      "start_date": "2022-03-01T03:00:00.000Z",
      "end_date": "2022-12-31T03:00:00.000Z"
    }
  ],
  "social_media": [],
  "skills": [],
  "events": [
    {
      "title": "Workshop de Inteligência Artificial na Prática",
      "event_id": "69b7056d8affb46c728583e0",
      "status": "Active"
    },
    {
      "title": "Visita Técnica — Google São Paulo",
      "event_id": "69b7056d8affb46c728583e4",
      "status": "Active"
    }
  ],
  "jobs": [
    {
      "job_id": "69bbfc52b2d03171e1c439ef",
      "title": "BRBRBRBRBRBR",
      "status": "Active"
    },
    {
      "job_id": "69bb27ce4cc35d687dffae2d",
      "title": "BRBRBRBRBRBR",
      "status": "Deleted"
    },
    {
      "job_id": "69bb260844dbded927373944",
      "title": "blablalbalba",
      "status": "Active"
    },
    {
      "job_id": "69b09f3aa6fd5dbeab23474b",
      "title": "Desenvolvedor FullStack JavaScript",
      "status": "Active"
    },
    {
      "job_id": "69b03e5eabddec4a70674167",
      "title": "Desenvolvedor Full Stack TypeScript",
      "status": "Deleted"
    }
  ],
  "posts": [
    {
      "post_id": "69bb023ba2f3c68234a6f83b",
      "content": "Agora eu editei so de sacanagem",
      "create_date": "2026-03-18T19:51:23.486Z",
      "images": [],
      "comments_count": 0,
      "comments": [],
      "likes_count": 0,
      "likes": []
    },
    {
      "post_id": "69aa02beef85f8d0cb38ca66",
      "content": "Tentei editar",
      "create_date": "2026-03-05T22:25:02.904Z",
      "images": [],
      "comments_count": 0,
      "comments": [],
      "likes_count": 0,
      "likes": []
    },
    {
      "post_id": "69a9d4cfb755a17cd7967c72",
      "content": "editei esta postagem",
      "create_date": "2026-03-05T19:09:03.794Z",
      "images": [],
      "comments_count": 1,
      "comments": [
        {
          "content": "Realmente foi muito bacana professor!",
          "comment_id": "69adce432cab0f6ac1990e19",
          "create_date": "2026-03-08T19:30:11.657Z",
          "author": {
            "user_id": "69a86bf41cb9a26b750064a4",
            "name": "Nicolas Ferro",
            "perfil_photo": null,
            "user_status": "Active",
            "courses": [
              {
                "abbreviation": "LOG",
                "enrollmentYear": 2023
              }
            ]
          }
        }
      ],
      "likes_count": 1,
      "likes": [
        {
          "like_id": "69adc827d09b66686bd89e2f",
          "create_date": "2026-03-08T19:17:13.499Z",
          "author": {
            "user_id": "69a86bf41cb9a26b750064a4",
            "name": "Nicolas Ferro",
            "perfil_photo": null,
            "user_status": "Active",
            "courses": [
              {
                "abbreviation": "LOG",
                "enrollmentYear": 2023
              }
            ]
          }
        }
      ]
    },
    {
      "post_id": "69a9cb13f760e431b54b131e",
      "content": "Hoje tivemos o primeiro dia da semana da tecnologia. O evento foi um sucesso, as paletras foram incríveis e os alunos participaram bastante das palestras, além dos cursos incríveis que tivemos também.\n\nObrigado a todos que participaram!",
      "create_date": "2026-03-05T18:27:31.565Z",
      "images": [],
      "comments_count": 0,
      "comments": [],
      "likes_count": 0,
      "likes": []
    },
    {
      "post_id": "69a9c9e28cab6c8a9e32b538",
      "content": "Hoje tivemos o primeiro dia da semana da tecnologia. O evento foi um sucesso, as paletras foram incríveis e os alunos participaram bastante das palestras, além dos cursos incríveis que tivemos também.",
      "create_date": "2026-03-05T18:22:26.769Z",
      "images": [],
      "comments_count": 0,
      "comments": [],
      "likes_count": 0,
      "likes": []
    }
  ],
  "gender": "Male"
}
```

---

## GET /myProfile 🆕

Retorna o perfil do usuário logado

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Response (200)

```json
{
  "user_id": "69a864f5e704caa8ff079520",
  "perfil_photo": {
    "url": "https://res.cloudinary.com/alumni-fatecso/image/upload/v1773520519/images/69a864f5e704caa8ff079520_1773520517438.jpg",
    "public_id": "images/69a864f5e704caa8ff079520_1773520517438"
  },
  "name": "Leonardo Barbosa da Silva",
  "biography": "Estudante da FATEC e desenvolvedor C# na Apple",
  "user_type": "Student",
  "courses": [
    {
      "course_name": "Análise e Desenvolvimento de Sistemas",
      "enrollmentYear": 2025
    }
  ],
  "workplace_history": [
    {
      "workplace_user_id": "69b453af6739721bd34e54ff",
      "position": "Gerente de Banco de Dados",
      "function": "Quase todas possíveis",
      "workplace": {
        "company": "Google"
      },
      "start_date": "2026-01-29T03:00:00.000Z",
      "end_date": "2026-02-28T03:00:00.000Z"
    },
    {
      "workplace_user_id": "69b45168826012b4d65a4e23",
      "position": "Engenheiro de Software",
      "function": "Desenvolver novidades para o software IOS",
      "workplace": {
        "company": "Valid"
      },
      "start_date": "2022-03-01T03:00:00.000Z",
      "end_date": "2023-12-31T03:00:00.000Z"
    }
  ],
  "social_media": [
    {
      "id": "f138dd72-d838-4fbe-b897-bdb8d058f890",
      "type": "Github",
      "url": "https://github.com/NicolasAFerro"
    }
  ],
  "skills": [
    {
      "skill": {
        "name": "Node Js"
      }
    }
  ],
  "events": [
    {
      "title": "Workshop de Inteligência Artificial na Prática",
      "event_id": "69b7056d8affb46c728583e0",
      "status": "Active"
    },
    {
      "title": "Visita Técnica — Google São Paulo",
      "event_id": "69b7056d8affb46c728583e4",
      "status": "Active"
    }
  ],
  "jobs": [
    {
      "job_id": "69bbfc52b2d03171e1c439ef",
      "title": "BRBRBRBRBRBR",
      "status": "Active"
    },
    {
      "job_id": "69bb27ce4cc35d687dffae2d",
      "title": "BRBRBRBRBRBR",
      "status": "Deleted"
    },
    {
      "job_id": "69bb260844dbded927373944",
      "title": "blablalbalba",
      "status": "Active"
    },
    {
      "job_id": "69b09f3aa6fd5dbeab23474b",
      "title": "Desenvolvedor FullStack JavaScript",
      "status": "Active"
    },
    {
      "job_id": "69b03e5eabddec4a70674167",
      "title": "Desenvolvedor Full Stack TypeScript",
      "status": "Deleted"
    }
  ],
  "posts": [
    {
      "post_id": "69bb023ba2f3c68234a6f83b",
      "content": "Agora eu editei so de sacanagem",
      "create_date": "2026-03-18T19:51:23.486Z",
      "images": [],
      "comments_count": 0,
      "comments": [],
      "likes_count": 0,
      "likes": []
    },
    {
      "post_id": "69aa02beef85f8d0cb38ca66",
      "content": "Tentei editar",
      "create_date": "2026-03-05T22:25:02.904Z",
      "images": [],
      "comments_count": 0,
      "comments": [],
      "likes_count": 0,
      "likes": []
    },
    {
      "post_id": "69a9d4cfb755a17cd7967c72",
      "content": "editei esta postagem",
      "create_date": "2026-03-05T19:09:03.794Z",
      "images": [],
      "comments_count": 1,
      "comments": [
        {
          "content": "Realmente foi muito bacana professor!",
          "comment_id": "69adce432cab0f6ac1990e19",
          "create_date": "2026-03-08T19:30:11.657Z",
          "author": {
            "user_id": "69a86bf41cb9a26b750064a4",
            "name": "Nicolas Ferro",
            "perfil_photo": null,
            "user_status": "Active",
            "courses": [
              {
                "abbreviation": "LOG",
                "enrollmentYear": 2023
              }
            ]
          }
        }
      ],
      "likes_count": 1,
      "likes": [
        {
          "like_id": "69adc827d09b66686bd89e2f",
          "create_date": "2026-03-08T19:17:13.499Z",
          "author": {
            "user_id": "69a86bf41cb9a26b750064a4",
            "name": "Nicolas Ferro",
            "perfil_photo": null,
            "user_status": "Active",
            "courses": [
              {
                "abbreviation": "LOG",
                "enrollmentYear": 2023
              }
            ]
          }
        }
      ]
    },
    {
      "post_id": "69a9cb13f760e431b54b131e",
      "content": "Hoje tivemos o primeiro dia da semana da tecnologia. O evento foi um sucesso, as paletras foram incríveis e os alunos participaram bastante das palestras, além dos cursos incríveis que tivemos também.\n\nObrigado a todos que participaram!",
      "create_date": "2026-03-05T18:27:31.565Z",
      "images": [],
      "comments_count": 0,
      "comments": [],
      "likes_count": 0,
      "likes": []
    },
    {
      "post_id": "69a9c9e28cab6c8a9e32b538",
      "content": "Hoje tivemos o primeiro dia da semana da tecnologia. O evento foi um sucesso, as paletras foram incríveis e os alunos participaram bastante das palestras, além dos cursos incríveis que tivemos também.",
      "create_date": "2026-03-05T18:22:26.769Z",
      "images": [],
      "comments_count": 0,
      "comments": [],
      "likes_count": 0,
      "likes": []
    }
  ],
  "gender": "Male",
  "email": "leo@email.com",
  "receive_notifications": true
}
```

---

## PUT /myProfile 🆕

Edita uma parte dos dados de perfil do usuário

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "name": "Leonardo Barbosa da Silva",
  "gender": "Male",
  "biography": "Estudante da FATEC e desenvolvedor C# na Apple",
  "receive_notifications": true
}
```

### Parâmetros

| Parâmetro             | Tipo    | Descrição            |
| --------------------- | ------- | -------------------- |
| name                  | string  | Nome do usuário      |
| gender                | string  | Gênero do usuário    |
| biography             | string  | Biografia do usuário |
| receive_notifications | boolean | Aceita notificações  |

### Response (200)

```json
{
  "message": "Perfil atualizado com sucesso!"
}
```

---

## PATCH /myProfile/profilePhoto 🆕

Atualiza a foto de perfil do usuário logado.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body (multipart/form-data)

| Campo | Tipo | Obrigatório | Descrição                      |
| ----- | ---- | ----------- | ------------------------------ |
| image | file | Sim         | Arquivo da nova foto de perfil |

### Example (form-data)

Key: image
Value: image.jpg

### Response (200)

```json
{
  "message": "Foto de perfil atualizada com sucesso!"
}
```

---

## DELETE /myProfile 🆕

Exclui (soft delete) o perfil do usuário logado.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Response (200)

```json
{
  "message": "Perfil excluído com sucesso!"
}
```

---

## POST /myProfile/job 🆕

Insere um novo emprego ao histórico de trabalho do usuário logado.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "company_name": "Apple",
  "position": "Engenheiro de Software",
  "functions": "Desenvolver novidades para o software IOS",
  "start_date": "01/03/2022",
  "end_date": "31/12/2022" //pode ser vazio (null) para quando for trabalho atual
}
```

### Parâmetros

| Parâmetro    | Tipo   | Descrição       |
| ------------ | ------ | --------------- |
| company_name | string | Nome da empresa |
| position     | string | Cargo           |
| functions    | string | Funções         |
| start_date   | string | Data de início  |
| end_date     | string | Data de saída   |

### Response (201)

```json
{
  "message": "Trabalho inserido com sucesso!"
}
```

---

## PUT /myProfile/job 🆕

Edita um emprego já inserido no histórico de trabalho do usuário logado.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "jobUserId": "69baf8cd0d3f9c15a790533a",
  "company_name": "Valid",
  "position": "Engenheiro de Software",
  "functions": "Desenvolver novidades para o software IOS",
  "start_date": "01/03/2022",
  "end_date": "31/12/2023" //pode ser vazio (null) para quando for trabalho atual
}
```

### Parâmetros

| Parâmetro    | Tipo   | Descrição       |
| ------------ | ------ | --------------- |
| jobUserId    | string | ID do trabalho  |
| company_name | string | Nome da empresa |
| position     | string | Cargo           |
| functions    | string | Funções         |
| start_date   | string | Data de início  |
| end_date     | string | Data de saída   |

### Response (200)

```json
{
  "message": "Trabalho atualizado com sucesso!"
}
```

---

## DELETE /myProfile/job 🆕

Excluí um emprego ja inserido no histórico de trabalho do usuário logado.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "jobUserId": "69baf8cd0d3f9c15a790533a"
}
```

### Parâmetros

| Parâmetro | Tipo   | Descrição      |
| --------- | ------ | -------------- |
| jobUserId | string | ID do trabalho |

### Response (200)

```json
{
  "message": "Trabalho excluído com sucesso!"
}
```

---

## POST /myProfile/skill 🆕

Insere uma habilidade no perfil do usuário logado.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "skill": "NodeJS"
}
```

### Parâmetros

| Parâmetro | Tipo   | Descrição          |
| --------- | ------ | ------------------ |
| skill     | string | Nome da habilidade |

### Response (201)

```json
{
  "message": "Habilidade inserida com sucesso!"
}
```

---

## DELETE /myProfile/skill 🆕

Exclui uma habilidade do perfil do usuário.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "user_skill_id": "69bc36b06772c409f30a43c0"
}
```

### Parâmetros

| Parâmetro     | Tipo   | Descrição        |
| ------------- | ------ | ---------------- |
| user_skill_id | string | ID da habilidade |

### Response (200)

```json
{
  "message": "Habilidade excluída com sucesso!"
}
```

---

## POST /myProfile/socialMedia 🆕

Insere uma rede social no perfil do usuário logado

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "media": "Github",
  "url": "https://github.com/leeo-s"
}
```

### Parâmetros

| Parâmetro | Tipo   | Descrição           |
| --------- | ------ | ------------------- |
| media     | string | Tipo da rede social |
| url       | string | Link da rede social |

### Response (201)

```json
{
  "message": "Rede social inserida com sucesso!"
}
```

---

## PATCH /myProfile/socialMedia 🆕

Editar o link de uma rede social no perfil do usuário logado.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "media": "Github",
  "url": "https://github.com/NicolasAFerro",
  "socialMediaId": "5be3e4cf-ea03-47bf-b4b8-477edd869a2b"
}
```

### Parâmetros

| Parâmetro     | Tipo   | Descrição           |
| ------------- | ------ | ------------------- |
| socialMediaId | string | ID da rede social   |
| media         | string | Tipo da rede social |
| url           | string | Link da rede social |

### Response (200)

```json
{
  "message": "Rede social alterada com sucesso!"
}
```

---

## DELETE /myProfile/socialMedia 🆕

Exclui uma rede social do perfil do usuário logado.

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Body

```json
{
  "socialMediaId": "5be3e4cf-ea03-47bf-b4b8-477edd869a2b"
}
```

### Parâmetros

| Parâmetro     | Tipo   | Descrição         |
| ------------- | ------ | ----------------- |
| socialMediaId | string | ID da rede social |

### Response (200)

```json
{
  "message": "Rede social excluída com sucesso!"
}
```

---

## GET /user/search 🆕

Realiza a pesquisa de usuários pelos campos: nome, curso, habilidades ou trabalhos.

### Example

```
GET /user/search?search=Análise%e%Desenvolvimento%de%Sistemas

ou

GET /user/search?search=Análise e Desenvolvimento de Sistemas
```

### Headers

```
Cookie: access_token=JWT_TOKEN
```

### Request Query

```Query params
?search={termo_de_busca}
```

### Response (200)

```json
[
  {
    "user_id": "69a864f5e704caa8ff079520",
    "name": "Leonardo Barbosa da Silva",
    "courses": [
      {
        "course_name": "Análise e Desenvolvimento de Sistemas",
        "enrollmentYear": 2025,
        "abbreviation": "ADS"
      }
    ],
    "social_media": [],
    "gender": "Male",
    "perfil_photo": {
      "url": "https://res.cloudinary.com/alumni-fatecso/image/upload/v1773520519/images/69a864f5e704caa8ff079520_1773520517438.jpg",
      "public_id": "images/69a864f5e704caa8ff079520_1773520517438"
    },
    "user_type": "Student",
    "workplace_history": [
      {
        "position": "Engenheiro de Software",
        "function": "Desenvolver novidades para o software IOS",
        "workplace": {
          "company": "Valid"
        },
        "start_date": "2022-03-01T03:00:00.000Z",
        "end_date": "2023-12-31T03:00:00.000Z"
      },
      {
        "position": "Gerente de Banco de Dados",
        "function": "Quase todas possíveis",
        "workplace": {
          "company": "Google"
        },
        "start_date": "2026-01-29T03:00:00.000Z",
        "end_date": "2026-02-28T03:00:00.000Z"
      }
    ],
    "skills": [
      {
        "skill": {
          "name": "Node Js"
        }
      }
    ]
  },
  {
    "user_id": "69ac9668196f7b43bf460352",
    "name": "nicolas",
    "courses": [
      {
        "course_name": "Análise e Desenvolvimento de Sistemas",
        "enrollmentYear": 2023,
        "abbreviation": "ADS"
      }
    ],
    "social_media": [],
    "gender": "Male",
    "perfil_photo": null,
    "user_type": "Student",
    "workplace_history": [],
    "skills": []
  }
]
```

---

# 🔑 Password

## POST /password/forgot-password

Envia o email para redefinição de senha do usuário informado.

### Request Body

```json
{
  "email": "leo@email.com"
}
```

### Parâmetros

| Parâmetro | Tipo   | Descrição        |
| --------- | ------ | ---------------- |
| email     | string | Email do usuário |

### Response (200)

```json
{
  "message": "Email de recuperação enviado com sucesso."
}
```

---

## PATCH /password/reset-password/:token 🔄

Atualiza a senha alterada do usuário no banco de dados

### Example

```
PATCH /password/reset-password/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YTg2NGY1ZTcwNGNhYThmZjA3OTUyMCIsImlhdCI6MTc3MzkzMzMwMCwiZXhwIjoxNzczOTMzOTAwfQ.ED2GGkLFiLeclqJ0F86-yKH827KC_JdKecCGONMehEs
```

### Request Body

```json
{
  "password": "NovaSenha",
  "confirmPassword": "NovaSenha"
}
```

### Parâmetros

| Parâmetro       | Tipo   | Descrição                 |
| --------------- | ------ | ------------------------- |
| password        | string | Nova senha                |
| confirmPassword | string | Confirmação da nova senha |

### Response (200)

```json
{
  "message": "Senha alterada com sucesso!"
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
Eventos (In Progress)
Admin (In Progress)
Chat (In Progress)
```

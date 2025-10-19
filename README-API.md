# 📚 Documentação da API - Sistema Alumni

## 🔐 Autenticação

- Tipo: Bearer Token (JWT)
- Header: `Authorization: Bearer <token>`
- Parameters: `route/<token>`

---

## 👤 POST /user/register

**Descrição:** Cria um novo usuário no sistema.

### 🔸 Requisição

**URL:** `/user/register`  
**Método:** `POST`  
**Corpo (JSON):**

#### 🔹 Corpo

{
"name": "Leonardo Silva",
"email": "leonardo@email.com",
"password": "Leonardo123!",
"enrollmentYear": 2023,
"type": "Aluno",
"course": "Análise e Desenvolvimento de Sistemas"
}

#### 🔹 Resposta

{
"message": "Usuário cadastrado com sucesso!"
}

## 👤 POST /user/login

**Descrição:** Gera o token de login do usuário no sistema.

### 🔸 Requisição

**URL:** `/user/login`  
**Método:** `POST`  
**Corpo (JSON):**

#### 🔹 Corpo

{
"email": "leonardo@email.com",
"password": "Leonardo123!"
}

#### 🔹 Resposta

{
"token": <token>
}

## 👤 GET /user/list-users

**Descrição:** Lista os usuários cadastrados no sistema.

### 🔸 Requisição

**URL:** `/user/list-users`  
**Método:** `GET`  
**Corpo (JSON):**

#### 🔹 Headers authorization

{
Bearer <token>
}

#### 🔹 Resposta

[
{
"name": "Alumni Fatec",
"email": "projetoalumnifatecso@gmail.com",
"enrollmentYear": 2023,
"userType": {
"userType": "Admin"
},
"coursesRelation": [
{
"course": {
"name": "Análise e Desenvolvimento de Sistemas"
}
}
]
},
{
"name": "Leonardo Silva",
"email": "leonardo@email.com",
"enrollmentYear": 2023,
"userType": {
"userType": "Aluno"
},
"coursesRelation": [
{
"course": {
"name": "Análise e Desenvolvimento de Sistemas"
}
}
]
}
]

## 👤 POST /password/forgotPassword

**Descrição:** Envia o email de recuperação de senha do usuário.

### 🔸 Requisição

**URL:** `/password/forgotPassword`  
**Método:** `POST`  
**Corpo (JSON):**

#### 🔹 Corpo

{
"email": "leonardo@email.com"
}

#### 🔹 Resposta

"Email de recuperação enviado com sucesso."

## 👤 PATCH /password/resetPassword/:token

**Descrição:** Reseta a senha fornecida pelo usuário.

### 🔸 Requisição

**URL:** `/password/resetPassword/:token`  
**Método:** `PATCH`  
**Corpo (JSON):**

#### 🔹 Parâmetros de rota

| Parâmetro | Tipo   | Obrigatório | Descrição                                         |
| --------- | ------ | ----------- | ------------------------------------------------- |
| `token`   | string | Sim         | Token de redefinição de senha enviado por e-mail. |

#### 🔹 Corpo

{
"password": "Leonardo12345!"
}

#### 🔹 Resposta

"Senha alterada com sucesso!"

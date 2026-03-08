use('DesenvolvimentoAlumni');

// Atualiza um usuário pelo email
db.getCollection('User').updateOne(
  { email: 'nicolasalexandrinoferro@gmail.com' }, // filtro
  {
    $set: {
      user_status: 'Active',
      user_type: 'Student',
    },
  }
);

export function messageApproveUser(userName, urlPlatform) {
  return `<div style="width: 100%; text-align: center; font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px 0;">
  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td align="center" style="color: #333333; font-size: 18px;">
        <h3 style="margin-top: 0;">Bem-vindo(a), ${userName}!</h3>

        <p style="margin: 10px 0 20px 0;">
          Seu perfil no <strong>Sistema Alumni Fatec Sorocaba</strong> foi aprovado!
        </p>

        <p style="margin: 10px 0 20px 0;">
          Agora você pode se conectar com outros ex-alunos, compartilhar experiências,
          acompanhar novidades e expandir sua rede profissional.
        </p>

        <a href="${urlPlatform}" 
           style="background-color: #AE0C0D;
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 8px;
                  display: inline-block;
                  font-weight: bold;
                  margin: 20px 0;">
          ACESSAR PLATAFORMA
        </a>

        <p style="margin-top: 20px; color: #555555;">
          Complete seu perfil para aproveitar ao máximo todos os recursos disponíveis.
        </p>

        <p style="margin-top: 10px; color: #777777; font-size: 14px;">
          Se você tiver qualquer dúvida, nossa equipe estará pronta para ajudar.
        </p>

        <p style="margin-top: 25px; color: #999999; font-size: 13px;">
          © ${new Date().getFullYear()} Alumni — Conectando histórias e oportunidades.
        </p>
      </td>
    </tr>
  </table>
</div>`;
}

export function messageRefuseUser(userName, urlPlatform) {
  return `<div style="width: 100%; text-align: center; font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px 0;">
  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td align="center" style="color: #333333; font-size: 18px;">
        <h3 style="margin-top: 0;">Olá, ${userName}</h3>

        <p style="margin: 10px 0 20px 0;">
          Após a análise realizada pela administração, seu cadastro no 
          <strong>Sistema Alumni Fatec Sorocaba</strong> não pôde ser aprovado neste momento.
        </p>

        <p style="margin: 10px 0 20px 0;">
          Isso pode ocorrer devido a informações incompletas ou divergentes no cadastro.
          Caso tenha sido um engano, você pode realizar um novo cadastro normalmente.
        </p>

        <p style="margin: 10px 0 20px 0;">
          Você pode se cadastrar novamente utilizando <strong>o mesmo e-mail</strong>, 
          corrigindo ou atualizando suas informações.
        </p>

        <a href="${urlPlatform}" 
           style="background-color: #AE0C0D;
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 8px;
                  display: inline-block;
                  font-weight: bold;
                  margin: 20px 0;">
          REALIZAR NOVO CADASTRO
        </a>

        <p style="margin-top: 20px; color: #555555;">
          Se você acredita que esta decisão foi um erro ou possui dúvidas,
          recomendamos realizar um novo cadastro revisando os dados informados, e, após isso, entre em contato com a administração do sistema.
        </p>

        <p style="margin-top: 10px; color: #777777; font-size: 14px;">
          Agradecemos seu interesse em participar da comunidade Alumni.
        </p>

        <p style="margin-top: 25px; color: #999999; font-size: 13px;">
          © ${new Date().getFullYear()} Alumni — Conectando histórias e oportunidades.
        </p>
      </td>
    </tr>
  </table>
</div>`;
}

export function messagePasswordRecovery(userName, urlRecovery) {
  return `<div style="width: 100%; text-align: center; font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px 0;">
  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td align="center" style="color: #333333; font-size: 18px;">
        <h3 style="margin-top: 0;">Olá, ${userName}</h3>
        <p style="margin: 10px 0 20px 0;">Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:</p>

        <a href="${urlRecovery}" 
           style="background-color: #AE0C0D;
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 8px;
                  display: inline-block;
                  font-weight: bold;
                  margin: 20px 0;">
          REDEFINIR SENHA
        </a>

        <p style="margin-top: 20px; color: #555555;">Este link irá expirar em 10 minutos.</p>
        <p style="margin-top: 10px; color: #777777; font-size: 14px;">Se você não reconhece esta solicitação, apenas ignore este e-mail.</p>
      </td>
    </tr>
  </table>
</div>`;
}

export function messageBanUser(userName, reason) {
  return `<div style="width: 100%; text-align: center; font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px 0;">
  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td align="center" style="color: #333333; font-size: 18px;">
        <h3 style="margin-top: 0; color: #AE0C0D;">Olá, ${userName}</h3>

        <p style="margin: 10px 0 20px 0;">
          Informamos que sua conta foi <strong>suspensa permanentemente</strong> por violação das diretrizes da plataforma.
        </p>

        <div style="background-color: #f8f8f8; border-left: 4px solid #AE0C0D; padding: 15px; margin: 20px 0; text-align: center; border-radius: 6px;">
          <p style="margin: 0; font-size: 15px; color: #555555;">
            <strong>Motivo do banimento:</strong><br>
            ${reason}
          </p>
        </div>

        <p style="margin-top: 20px; color: #555555;">
          Caso acredite que isso tenha ocorrido por engano, entre em contato com a equipe de suporte.
        </p>

        <p style="margin-top: 10px; color: #777777; font-size: 14px;">
          Agradecemos sua compreensão.
        </p>
      </td>
    </tr>
  </table>
</div>`;
}

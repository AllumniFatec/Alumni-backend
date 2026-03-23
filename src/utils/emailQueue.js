import sendEmail from './email.js';

// Fila em memória (FIFO) para não bloquear o fluxo da API
// OBS: se a aplicação reiniciar, as tarefas pendentes são perdidas.
const queue = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    while (queue.length > 0) {
      const next = queue.shift();
      try {
        await sendEmail(next);
      } catch (err) {
        // Não interrompe a API: apenas registra e segue para a próxima tarefa.
        console.error('[emailQueue] Erro ao enviar email:', err);
      }
    }
  } finally {
    isProcessing = false;
  }
};

export const enqueueEmail = (emailPayload) => {
  queue.push(emailPayload);
  // Dispara o worker sem bloquear a chamada original.
  void processQueue();
};


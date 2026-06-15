/**
 * Mock Email Service (Bilingual: PT-BR / EN)
 * RF-024 / RNF-011 / Section 13 AGENTS.md
 */

type EmailOptions = {
  to: string;
  subject: string;
  body: string;
};

async function sendMockEmail({ to, subject, body }: EmailOptions) {
  console.log("-----------------------------------------");
  console.log(`[MOCK EMAIL SENT]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body}`);
  console.log("-----------------------------------------");
  return { success: true };
}

export async function sendConfirmationEmail(to: string, locale: string, bookingDetails: {
  id: string;
  userName: string;
  checkIn: string;
  checkOut: string;
  total: number;
}) {
  const isEn = locale === 'en';
  const subject = isEn ? "Booking Confirmation - Sr. Almeida" : "Confirmação de Reserva - Sr. Almeida";

  const body = isEn
    ? `Hello ${bookingDetails.userName},\n\nYour booking #${bookingDetails.id} is confirmed!\nCheck-in: ${bookingDetails.checkIn}\nCheck-out: ${bookingDetails.checkOut}\nTotal: R$ ${bookingDetails.total}\n\nThank you for choosing Sr. Almeida!`
    : `Olá ${bookingDetails.userName},\n\nSua reserva #${bookingDetails.id} está confirmada!\nCheck-in: ${bookingDetails.checkIn}\nCheck-out: ${bookingDetails.checkOut}\nTotal: R$ ${bookingDetails.total}\n\nObrigado por escolher o Sr. Almeida!`;

  return sendMockEmail({ to, subject, body });
}

export async function sendCancellationEmail(to: string, locale: string, cancellationDetails: {
  id: string;
  refund: number;
  fee: number;
}) {
  const isEn = locale === 'en';
  const subject = isEn ? "Booking Cancellation - Sr. Almeida" : "Cancelamento de Reserva - Sr. Almeida";

  const body = isEn
    ? `Hello,\n\nYour booking #${cancellationDetails.id} has been cancelled.\nRefund amount: R$ ${cancellationDetails.refund}\nCancellation fee: R$ ${cancellationDetails.fee}\n\nWe hope to see you again soon.`
    : `Olá,\n\nSua reserva #${cancellationDetails.id} foi cancelada.\nValor estornado: R$ ${cancellationDetails.refund}\nTaxa de cancelamento: R$ ${cancellationDetails.fee}\n\nEsperamos ver você em breve.`;

  return sendMockEmail({ to, subject, body });
}

export async function sendPasswordResetEmail(to: string, locale: string, resetLink: string) {
  const isEn = locale === 'en';
  const subject = isEn ? "Password Recovery - Sr. Almeida" : "Recuperação de Senha - Sr. Almeida";

  const body = isEn
    ? `Hello,\n\nYou requested a password reset. Click the link below to set a new password:\n${resetLink}\n\nIf you didn't request this, please ignore this email.`
    : `Olá,\n\nVocê solicitou a recuperação de senha. Clique no link abaixo para definir uma nova senha:\n${resetLink}\n\nSe você não solicitou isso, por favor ignore este e-mail.`;

  return sendMockEmail({ to, subject, body });
}

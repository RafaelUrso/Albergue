/**
 * Utilitários para tratamento de datas sem deslocamento de fuso horário.
 * Conforme AGENTS.md, as diárias começam/terminam ao meio-dia (12:00).
 */

/**
 * Converte uma string "YYYY-MM-DD" para um objeto Date às 12:00:00 UTC.
 */
export function parseDateUTC(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  const [year, month, day] = dateStr.split('-').map(Number);
  // Mês no JS Date é 0-indexed
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  return date;
}

/**
 * Converte um objeto Date para uma string "YYYY-MM-DD" baseada nos seus componentes UTC.
 */
export function formatDateToISO(date: Date): string {
  if (isNaN(date.getTime())) return '';
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Exibe a data formatada de acordo com o locale, sem sofrer deslocamento de fuso.
 */
export function formatDisplayDate(date: Date | string, locale: string): string {
  const d = typeof date === 'string' ? parseDateUTC(date) : date;
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString(locale, {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Retorna a data de "hoje" no formato YYYY-MM-DD (horário UTC).
 */
export function getTodayISO(): string {
  const now = new Date();
  // Para garantir que "hoje" seja consistente, usamos os componentes locais ou UTC?
  // O bug é que ao escolher dia 2 vira dia 1.
  // Se o usuário está no Brasil (UTC-3) e é 22h do dia 1, em UTC já é dia 2.
  // Mas se ele escolhe no calendário do input type="date", o valor retornado é "YYYY-MM-DD" local.
  // Portanto, para "hoje" de comparação em min=, devemos usar a data local do browser.
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

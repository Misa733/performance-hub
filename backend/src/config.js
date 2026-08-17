export const META_MENSAL = 30;
export const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 60);

export function validarConfiguracaoGoogle() {
  const obrigatorias = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SPREADSHEET_ID'];
  const ausentes = obrigatorias.filter((chave) => !process.env[chave]);
  if (ausentes.length) {
    const erro = new Error(`Configuração ausente: ${ausentes.join(', ')}`);
    erro.status = 503;
    throw erro;
  }
}

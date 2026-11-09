/**
 * Maps a failed POST /orders to the message shown on the checkout (ProblemDetails status codes). The customer-facing
 * sentence comes first; for 4xx the server's own reason (`detail`) follows, and for a server fault the trace id, so a
 * failure can be matched to its line in the API log instead of staying a generic "try again".
 */
export function describeOrderError(error) {
  const problem = error?.problem ?? null
  const detail = typeof problem?.detail === 'string' ? problem.detail.trim() : ''
  const traceId = typeof problem?.traceId === 'string' ? problem.traceId : ''

  switch (error?.status) {
    case 0:
      return 'Serverə qoşulmaq mümkün olmadı. İnternet bağlantınızı yoxlayıb yenidən cəhd edin.'
    case 400:
      return withDetail('Sifariş məlumatlarında xəta var. Formu yoxlayıb yenidən cəhd edin.', detail)
    case 404:
      return withDetail('Səbətinizdəki bəzi məhsullar artıq mövcud deyil. Səbəti yeniləyin.', detail)
    case 409:
      return withDetail('Səbətinizdəki bəzi məhsullar üçün kifayət qədər stok yoxdur. Miqdarı azaldın.', detail)
    default: {
      const base = 'Sifariş yaradılmadı. Bir az sonra yenidən cəhd edin.'
      return traceId ? `${base} (Xəta kodu: ${traceId})` : base
    }
  }
}

function withDetail(message, detail) {
  return detail ? `${message} (${detail})` : message
}

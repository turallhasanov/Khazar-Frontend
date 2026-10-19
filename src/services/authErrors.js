/** Customer-facing (Azerbaijani) messages for failed /api/auth calls, keyed by the API's errorCode. */
const MESSAGES = {
  invalid_credentials: 'E-poçt və ya şifrə yanlışdır.',
  email_not_confirmed: 'E-poçt ünvanınız hələ təsdiqlənməyib.',
  email_already_registered: 'Bu e-poçt ünvanı ilə artıq hesab mövcuddur.',
  email_already_confirmed: 'Bu e-poçt ünvanı artıq təsdiqlənib. Daxil ola bilərsiniz.',
  weak_password: 'Şifrə ən azı 8 simvol olmalı, hərf və rəqəm ehtiva etməlidir.',
  invalid_verification_code: 'Təsdiq kodu yanlışdır.',
  verification_code_expired: 'Təsdiq kodunun vaxtı bitib. Yeni kod istəyin.',
  too_many_attempts: 'Çox sayda yanlış cəhd. Yeni kod istəyin.',
  invalid_refresh_token: 'Sessiyanın vaxtı bitib. Yenidən daxil olun.',
}

export function describeAuthError(error) {
  if (error?.code && MESSAGES[error.code]) return MESSAGES[error.code]
  switch (error?.status) {
    case 0:
      return 'Serverə qoşulmaq mümkün olmadı. İnternet bağlantınızı yoxlayın.'
    case 400:
      return 'Məlumatlarda xəta var. Formu yoxlayıb yenidən cəhd edin.'
    case 429:
      return 'Çox sayda cəhd edildi. Bir dəqiqə gözləyib yenidən cəhd edin.'
    default:
      return 'Xəta baş verdi. Bir az sonra yenidən cəhd edin.'
  }
}

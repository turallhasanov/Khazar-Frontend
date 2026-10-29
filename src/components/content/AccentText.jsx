/**
 * Admin-edited text where *asterisks* mark the accent words: "Mövsümün *ilk* parçaları" renders "ilk" with
 * `className`. Plain text only — no HTML is ever interpreted.
 */
export function AccentText({ text, className }) {
  return text.split('*').map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className={className}>
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}

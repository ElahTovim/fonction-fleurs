/** Le gras est noté **ainsi** dans les textes du cours : on le rend sans
 *  dépendance et sans injecter de HTML. */
export function Riche({ texte }: { texte: string }) {
  return (
    <>
      {texte.split("**").map((part, i) =>
        i % 2 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
      )}
    </>
  );
}

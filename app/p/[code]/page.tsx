import { Game } from "@/components/Game";

export default async function GamePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <Game code={code.toUpperCase()} />;
}

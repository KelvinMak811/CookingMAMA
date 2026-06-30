interface DifficultyStarsProps {
  difficulty: number;
  max?: number;
}

export function DifficultyStars({ difficulty, max = 5 }: DifficultyStarsProps) {
  return (
    <span aria-label={`難度 ${difficulty} 星`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < difficulty ? "text-warning" : "text-light-emphasis"}>
          ★
        </span>
      ))}
    </span>
  );
}

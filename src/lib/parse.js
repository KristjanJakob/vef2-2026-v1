export function parseLine(line) {
  if (!line || typeof line !== 'string') return null;

  const parts = line.split(',');
  if (parts.length < 6) return null;

  const [categoryNumber, subCategory, difficulty, quality, question, answer] = parts;

  if (!subCategory || !question || !answer) return null;

  return {
    categoryNumber,
    subCategory,
    difficulty,
    quality,
    question,
    answer,
  };
}

import { NEUTRAL_SCORE } from "./weights";
import { normalizeTerm } from "./text";

export interface InterestResult {
  score: number;
  matchedInterests: string[];
  matchedTags: string[];
}

interface VocabTerm {
  normalized: string;
  original: string;
}

function buildVocab(category: string, tags: readonly string[]): VocabTerm[] {
  const terms: VocabTerm[] = [];
  const categoryNorm = normalizeTerm(category);
  if (categoryNorm.length > 0) {
    terms.push({ normalized: categoryNorm, original: category });
  }
  for (const tag of tags) {
    const tagNorm = normalizeTerm(tag);
    if (tagNorm.length > 0) {
      terms.push({ normalized: tagNorm, original: tag });
    }
  }
  return terms;
}

function termMatchesInterest(term: string, interest: string): boolean {
  if (term === interest) {
    return true;
  }
  if (interest.length >= 3) {
    return term.includes(interest);
  }
  return false;
}

export function scoreInterest(
  interests: readonly string[],
  category: string,
  tags: readonly string[]
): InterestResult {
  const normalizedInterests = interests
    .map(normalizeTerm)
    .filter((interest) => interest.length > 0);

  if (normalizedInterests.length === 0) {
    return {
      score: NEUTRAL_SCORE,
      matchedInterests: [],
      matchedTags: [],
    };
  }

  const vocab = buildVocab(category, tags);

  const matchedInterests = interests.filter((raw) => {
    const normalized = normalizeTerm(raw);
    return (
      normalized.length > 0 &&
      vocab.some((term) => termMatchesInterest(term.normalized, normalized))
    );
  });

  const matchedTags = tags.filter((tag) => {
  const normalized = normalizeTerm(tag);
  return (
    normalized.length > 0 &&
    normalizedInterests.some((interest) =>
      termMatchesInterest(normalized, interest)
    )
  );
});

  const score =
    (matchedInterests.length / normalizedInterests.length) * NEUTRAL_SCORE * 2;

  return {
    score,
    matchedInterests,
    matchedTags,
  };
}
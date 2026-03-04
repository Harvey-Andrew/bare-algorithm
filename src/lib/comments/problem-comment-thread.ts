export function getProblemCommentTerm(category: string, problem: string): string {
  return `problem:${category}/${problem}`;
}

export function makeReference(createdOn: string, sequence: number): string {
  const stamp = `${createdOn.slice(2, 4)}${createdOn.slice(5, 7)}${createdOn.slice(8, 10)}`;
  return `EB-${stamp}-${String(sequence).padStart(2, "0")}`;
}

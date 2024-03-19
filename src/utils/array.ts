export function compareArray<T>(a: T[], b: T[]): boolean {
  return (
    a.length === b.length && a.every((element, index) => element === b[index])
  )
}

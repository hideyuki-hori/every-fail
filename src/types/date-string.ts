type Year = `${number}${number}${number}${number}`
type Month = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | `1${0 | 1 | 2}`
type Day =
  | `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | `${1 | 2}${number}`
  | `3${0 | 1}`
type Sep = '-'
export type DateString = `${Year}${Sep}${Month}${Sep}${Day}`

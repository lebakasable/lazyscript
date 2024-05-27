type Lazy<T> = () => T;

const sum = (a: Lazy<number>, b: Lazy<number>): Lazy<number> => () =>
  a() + b();

// console.log(sum(() => 10 + 5, () => 20)());

const first = (a: Lazy<number>, b: Lazy<number>): Lazy<number> => a;

const hang = <T>(): T => hang();

// console.log(first(() => 10, () => hang())());

const trace = <T>(x: Lazy<T>, message: string): Lazy<T> => () => {
  console.log(message);
  return x();
};

const and = (a: Lazy<boolean>, b: Lazy<boolean>): Lazy<boolean> => () =>
  !a() ? false : b();

const or = (a: Lazy<boolean>, b: Lazy<boolean>): Lazy<boolean> => () =>
  a() ? true : b();

// console.log('false && false =', and(trace(() => false, 'L'), trace(() => false, 'R'))());
// console.log('true && false =', and(trace(() => true, 'L'), trace(() => false, 'R'))());
// console.log('true && true =', and(trace(() => true, 'L'), trace(() => true, 'R'))());
// console.log('false && true =', and(trace(() => false, 'L'), trace(() => true, 'R'))());
// console.log('false || false =', or(trace(() => false, 'L'), trace(() => false, 'R'))());
// console.log('true || false =', or(trace(() => true, 'L'), trace(() => false, 'R'))());
// console.log('true || true =', or(trace(() => true, 'L'), trace(() => true, 'R'))());
// console.log('false || true =', or(trace(() => false, 'L'), trace(() => true, 'R'))());

type LazyList<T> = Lazy<{
  head: Lazy<T>,
  tail: LazyList<T>,
} | null>;

const toLazyList = <T>(xs: T[]): LazyList<T> => () =>
  xs.length > 0
  ? {
      head: () => xs[0],
      tail: toLazyList(xs.slice(1)),
    }
  : null;

// console.log(toLazyList([1, 2, 3])())
// console.log(toLazyList([1, 2, 3])().head())
// console.log(toLazyList([1, 2, 3])().tail().head())
// console.log(toLazyList([1, 2, 3])().tail().tail().head())

const range = (begin: number): LazyList<number> => () =>
  ({
    head: () => begin,
    tail: range(begin + 1),
  });

// console.log(range(3)());
// console.log(range(3)().head());
// console.log(range(3)().tail().head());
// console.log(range(3)().tail().tail().head());
// console.log(range(3)().tail().tail().tail().head());
// console.log(range(3)().tail().tail().tail().tail().head());

const printLazyList = <T>(xs: LazyList<T>) => {
  let pair = xs();
  while (pair) {
    console.log(pair.head());
    pair = pair.tail();
  }
};

// printLazyList(toLazyList([1, 2, 3, 4, 5]));
// printLazyList(range(3));

const take = <T>(n: number) => (xs: LazyList<T>): LazyList<T> => () => {
  let pair = xs();
  return n > 0
    ? {
        head: pair.head,
        tail: take<T>(n - 1)(pair.tail),
      }
    : null;
};

// printLazyList(take(10)(range(0)));

const filter = <T>(f: (T) => boolean) => (xs: LazyList<T>): LazyList<T> => () => {
  let pair = xs();
  if (pair) {
    let x = pair.head();
    return f(x)
      ? {
          head: pair.head,
          tail: filter<T>(f)(pair.tail),
        }
      : filter<T>(f)(pair.tail)();
  } else {
    return null;
  }
};

// printLazyList(take(10)(filter((x) => x%2 === 0)(range(0))));

const pipe = <T>(value: T) => ({
  '>': <R>(f: (value: T) => R) => pipe(f(value)),
});

// pipe(range(0))
//   ['>'] (filter(x => x%2 === 0))
//   ['>'] (take(10))
//   ['>'] (printLazyList);

const sieve = (xs: LazyList<number>): LazyList<number> => () => {
  let pair = xs();
  if (pair) {
    let y = pair.head();
    return {
      head: pair.head,
      tail: sieve(filter<number>(x => x%y !== 0)(pair.tail)),
    };
  } else {
    return null;
  }
};

pipe(range(2))
  ['>'] (sieve)
  ['>'] (take(10))
  ['>'] (printLazyList);


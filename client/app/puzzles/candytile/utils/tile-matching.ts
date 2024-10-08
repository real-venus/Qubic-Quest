import _ from "lodash";
import uuid from "react-uuid";

const COLUMN_NUMBER = 9;
const ROW_NUMBER = 9;

const ADJACENT_INDEXES = [-COLUMN_NUMBER, 1, COLUMN_NUMBER, -1];

export const tilesAreAdjacent = (firstIndex: number, secondIndex: number): boolean => {
  const areAdjacent = ADJACENT_INDEXES.some((x) => x + firstIndex === secondIndex);
  return areAdjacent;
};

type TileMovePosition = [number, number];

export const getTileTargetPosition = (index: number, tileTargetIndex: number): TileMovePosition => {
  const top = tileTargetIndex === index - ROW_NUMBER ? -100 : tileTargetIndex === index + ROW_NUMBER ? 100 : 0;
  const left = tileTargetIndex === index - 1 ? -100 : tileTargetIndex === index + 1 ? 100 : 0;
  return [top, left];
};

type CandyInLevel = { index: number } & Candy;

type CandyMatchings = {
  up: number;
  right: number;
  down: number;
  left: number;
  matched: boolean;
};

const getCandyMatchings = (candy: CandyInLevel, items: readonly LevelItem[]): CandyMatchings => {
  //console.log(candy.index);
  const rowIndex = Math.ceil((candy.index + 1) / ROW_NUMBER);
  const columnIndex = candy.index + 1 - (rowIndex - 1) * ROW_NUMBER;

  const leftIterations = columnIndex - 1;
  const upIterations = rowIndex - 1;
  const rightIterations = COLUMN_NUMBER - columnIndex;
  const downIterations = ROW_NUMBER - rowIndex;

  const matchings = {
    up: { count: 0, iterations: upIterations, getAdjacent: (cycle: number) => candy.index - COLUMN_NUMBER * cycle },
    right: { count: 0, iterations: rightIterations, getAdjacent: (cycle: number) => candy.index + cycle },
    down: { count: 0, iterations: downIterations, getAdjacent: (cycle: number) => candy.index + COLUMN_NUMBER * cycle },
    left: { count: 0, iterations: leftIterations, getAdjacent: (cycle: number) => candy.index - cycle },
  };

  Object.values(matchings).forEach((direction) => {
    for (let i = 1; i < direction.iterations + 1; i++) {
      const adjacentCandy = items[direction.getAdjacent(i)] || null;
      if ((adjacentCandy as Candy)?.color !== candy.color) break;
      direction.count += 1;
    }
  });

  const up = matchings.up.count;
  const right = matchings.right.count;
  const down = matchings.down.count;
  const left = matchings.left.count;
  const matched = (up > 0 && down > 0) || (left > 0 && right > 0) || [up, down, left, right].some((x) => x > 1);

  /* console.log({
    up, right, down, left, matched
  }); */

  return { up, right, down, left, matched };
};

type MatchResult = {
  thereWereMatches: boolean;
  matchingList: MatchData[];
};

export const checkForMatchings = (items: readonly LevelItem[]): MatchResult => {
  const candies = [...items]
    .map((x, index) => ({ ...x, index }))
    .filter((x) => (x as Candy)?.type === "Candy") as CandyInLevel[];

  const candyMatchings: ({ index: number } & CandyMatchings)[] = [];
  candies.forEach((candy) => candyMatchings.push({ index: candy.index, ...getCandyMatchings(candy, items) }));

  return {
    thereWereMatches: candyMatchings.some((x) => x.matched),
    matchingList: candyMatchings.map((x) => ({ index: x.index, matched: x.matched } as MatchData)),
  };
};

type ItemAbove = {
  index: number | null;
  tileDistanceCount: number;
};

const getItemAbove = (itemIdex: number, items: readonly LevelItem[], tiles: readonly LevelTile[]): ItemAbove => {
  let nextItemIndex = itemIdex - COLUMN_NUMBER;
  let tileDistanceCount = 1;
  let aboveItem: number | null = null;

  while (nextItemIndex > -1) {
    const tileAvaliable = tiles[nextItemIndex] !== null;
    const itemEmtpy = items[nextItemIndex] === null;

    if (!tileAvaliable || itemEmtpy) {
      nextItemIndex -= COLUMN_NUMBER;
      tileDistanceCount += 1;
      continue;
    }

    aboveItem = nextItemIndex;
    break;
  }

  return {
    index: aboveItem,
    tileDistanceCount,
  };
};

export type NewItemPosition = { index: number; tilesToMove: number };
type RepositionResult = {
  repositionedItems: LevelItem[];
  newPositions: NewItemPosition[];
};

export const repositionItems = (items: readonly LevelItem[], tiles: readonly LevelTile[]): RepositionResult => {
  const repositionedItems = _.cloneDeep(items) as LevelItem[];
  const newPositions: NewItemPosition[] = [];

  for (let i = repositionedItems.length - 1; i > 0; i--) {
    const tileAvaliable = tiles[i] !== null;
    if (!tileAvaliable) continue;
    const item = repositionedItems[i];

    if (item === null) {
      const itemAbove = getItemAbove(i, repositionedItems, tiles);
      if (itemAbove.index !== null) {
        repositionedItems[i] = _.cloneDeep(repositionedItems[itemAbove.index]);
        repositionedItems[itemAbove.index] = null;
        newPositions.push({ index: itemAbove.index, tilesToMove: itemAbove.tileDistanceCount });
      }
    }
  }

  return {
    repositionedItems,
    newPositions,
  };
};

const candyColorArray: string[] = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"];
export const generateNewCandies = (items: readonly LevelItem[], tiles: readonly LevelTile[]): LevelItem[] => {
  const newCandies = _.cloneDeep(items) as LevelItem[];
  newCandies.forEach((item, index) => {
    const tileAvaliable = tiles[index] !== null;
    if (item === null && tileAvaliable) {
      newCandies[index] = {
        color: candyColorArray[Math.floor(Math.random() * candyColorArray.length)],
        type: "Candy",
        key: uuid(),
      } as Candy;
    }
  });

  return newCandies;
};

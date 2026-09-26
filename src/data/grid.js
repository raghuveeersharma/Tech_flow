// Layout grid used by every domain. Desktop node cards are 210 x 78, so a 310 x 170 cell leaves room
// for edge labels between nodes. A typical canvas uses cols 0-5 and rows 0-4.
export const GRID_X = 310;
export const GRID_Y = 170;

export const g = (col, row) => ({ x: col * GRID_X, y: row * GRID_Y });

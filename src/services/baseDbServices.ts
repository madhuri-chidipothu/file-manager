import { eq, ne, lt, lte, gt, gte, ilike, isNull, isNotNull } from "drizzle-orm";
import type { AnyColumn, InferSelectModel } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "../db/client";

type Relation = "=" | "!=" | "<" | "<=" | ">" | ">=" | "ILIKE" | "IS NULL" | "IS NOT NULL";

type TableRecord<T extends PgTable> = InferSelectModel<T>;

type TableColumns<T extends PgTable> = Record<string, AnyColumn>;

const getCol = <T extends PgTable>(table: T, column: string): AnyColumn =>
  (table as unknown as TableColumns<T>)[column];

const getCondition = (col: AnyColumn, relation: Relation, value: unknown) => {
  switch (relation) {
    case "!=": return ne(col, value);
    case "<": return lt(col, value);
    case "<=": return lte(col, value);
    case ">": return gt(col, value);
    case ">=": return gte(col, value);
    case "ILIKE": return ilike(col, value as string);
    case "IS NULL": return isNull(col);
    case "IS NOT NULL": return isNotNull(col);
    default: return eq(col, value);
  }
};

export const saveRecord = async <T extends PgTable>(
  table: T,
  data: Partial<TableRecord<T>>
): Promise<TableRecord<T>> => {
  const result = await db.insert(table as any).values(data as any).returning() as TableRecord<T>[];
  return result[0];
};

export const getSingleRecordByAColumnValue = async <T extends PgTable>(
  table: T,
  column: keyof TableRecord<T>,
  relation: Relation,
  value: unknown
): Promise<TableRecord<T> | undefined> => {
  const col = getCol(table, column as string);
  const result = await db.select().from(table as any).where(getCondition(col, relation, value)).limit(1) as TableRecord<T>[];
  return result[0];
};

export const getRecordByPrimaryKey = async <T extends PgTable>(
  table: T,
  id: number
): Promise<TableRecord<T> | undefined> => {
  const col = getCol(table, "id");
  const result = await db.select().from(table as any).where(eq(col, id)).limit(1) as TableRecord<T>[];
  return result[0];
};

export const updateRecordById = async <T extends PgTable>(
  table: T,
  id: number,
  data: Partial<TableRecord<T>>
): Promise<TableRecord<T>> => {
  const col = getCol(table, "id");
  const result = await db.update(table as any).set(data as any).where(eq(col, id)).returning() as TableRecord<T>[];
  return result[0];
};

export const deleteRecordById = async <T extends PgTable>(
  table: T,
  id: number
): Promise<void> => {
  const col = getCol(table, "id");
  await db.delete(table as any).where(eq(col, id));
};

export const deleteRecordsByAColumnValue = async <T extends PgTable>(
  table: T,
  column: keyof TableRecord<T>,
  value: unknown
): Promise<void> => {
  const col = getCol(table, column as string);
  await db.delete(table as any).where(eq(col, value as any));
};

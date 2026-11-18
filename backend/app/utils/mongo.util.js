const { ObjectId } = require("mongodb");

const toObjectId = (value) => {
  if (!value) return null;
  if (value instanceof ObjectId) return value;
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
};

const toDate = (value) => {
  if (value instanceof Date) return value;
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
};

const removeUndefined = (object) => {
  Object.keys(object).forEach((key) => {
    if (object[key] === undefined) delete object[key];
  });
  return object;
};

module.exports = { toObjectId, toDate, toNumber, removeUndefined };

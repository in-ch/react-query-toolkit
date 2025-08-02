/**
 * @param {T} obj1 - object 1
 * @param {T} obj2 - object 2
 * @returns {boolean} compare result
 */
const isDeepEqual = <T>(obj1: T, obj2: T): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export default isDeepEqual;

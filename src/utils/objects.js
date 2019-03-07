import { get as getValue, reduce } from 'lodash';

/**
 * direct copy of `defaultEqualityCheck` from reselect (https://github.com/reactjs/reselect)
 * @param {any} a
 * @param {any} b
 * @return {boolean}
 */
function defaultEqualityCheck(a, b) {
  return a === b;
}

/**
 * direct copy of `areArgumentsShallowlyEqual` from reselect (https://github.com/reactjs/reselect)
 * @param {Function} equalityCheck
 * @param {any} prev
 * @param {any} next
 * @return {boolean}
 */
function argumentsAreShallowlyEqual(equalityCheck, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
  const length = prev.length;
  for (let i = 0; i < length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false;
    }
  }

  return true;
}

/**
 * direct copy of `shallowEqual` from fbjs (https://github.com/facebook/fbjs)
 *
 * Performs equality check by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 *
 * @param {Object} objA
 * @param {Object} objB
 * @return {boolean}
 */
export function shallowEqual(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null ||
    typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}

/**
 * this function is a direct copy of `defaultMemoize` from reselect (https://github.com/reactjs/reselect)
 * memoize a function based on most recently passed-in arguments
 * @param {function} func
 * @return {function(...[*])}
 */
export function memoizeByLastCall(func, equalityCheck = defaultEqualityCheck) {
  let lastArgs = null;
  let lastResult = null;

  return (...rest) => {
    if (!argumentsAreShallowlyEqual(equalityCheck, lastArgs, rest)) {
      lastResult = func.apply(null, rest);
    }

    lastArgs = rest;
    return lastResult;
  };
}

/**
 * if given property is a function, call it with given obj
 * otherwise, plain old object access
 * @param obj
 * @param property
 * @returns {*}
 */
export function propResolver(obj, property) {
  return typeof property === 'function' ? property(obj) : getValue(obj, property);
}

/**
 * Quick Merge merges 1 level of properties of source objects into the target object,
 * and returns the target object.
 *
 * usage:
 *  source1 = {
 *    feature: { global: ..., canada: ..., },
 *    mesh: { borders: ..., },
 *  }
 *
 *  source2 = {
 *    feature: { usa: ... },
 *  }
 *
 *  quickMerge({}, source1, source2)
 *  -> {
 *       feature: { global: ..., canada: ..., usa: ..., },
 *       mesh: { borders: ..., },
 *     }
 *
 * @param {Object} target -> target object
 * @param {Object} sources -> source objects
 * @returns {Object} Merged target object
 */
export function quickMerge(target = {}, ...sources) {
  return reduce(sources, (acc, source) => Object.assign(acc, reduce(source, (acc2, obj, key) => ({
    ...acc2,
    [key]: {
      ...acc2[key],
      ...obj,
    },
  }), acc)), target);
}

import { STATUS } from "@/src/services/transactions/transaction-history";
import { LocalStorage } from "@/utils/localstorage";

/**
 *
 * @typedef IHistoryEntry
 * @prop {string} hash
 * @prop {import('@/src/services/transactions/const').E_METHODS} methodName
 * @prop {number} timestamp
 * @prop {number} status 0 - failure | 1 - success | pending - 2
 * @prop {object} [data]
 *
 *
 * @typedef {Object.<string, IHistoryEntry[]>} THistory
 */

const MAX_TRANSACTION_HISTORY = 100;

/**
 *
 * @param {THistory} object
 */
function verifyShapeIntegrity(object) {
  return Object.values(object).every((entries) => {
    if (Array.isArray(entries)) {
      return entries.every((item) => {
        return (
          item.hasOwnProperty("hash") &&
          item.hasOwnProperty("methodName") &&
          item.hasOwnProperty("status") &&
          item.hasOwnProperty("timestamp")
        );
      });
    }

    return false;
  });
}

class LSHistoryClass {
  /** @type THistory */
  state = {};

  init() {
    this.state = LocalStorage.get(
      LocalStorage.KEYS.TRANSACTION_HISTORY,
      (value) => {
        const val = JSON.parse(value);

        if (
          typeof val === "object" &&
          !Array.isArray(val) &&
          verifyShapeIntegrity(val)
        ) {
          return val;
        }

        throw new Error(LocalStorage.LOCAL_STORAGE_ERRORS.INVALID_SHAPE);
      },
      // when an error is detected, we will set this default value
      {}
    );
  }

  /**
   *
   * @param {string} account
   * @param {string} networkId
   */
  setId(account, networkId) {
    this.id = `${account}:${networkId}`;

    if (!this.state.hasOwnProperty(this.id)) {
      this.state[this.id] = [];
    }

    this._update();
  }

  _update() {
    LocalStorage.set(LocalStorage.KEYS.TRANSACTION_HISTORY, this.state);
  }

  /**
   * @param {string} hash
   *
   * @returns {IHistoryEntry | false | undefined}
   */
  isExisting(hash) {
    if (this.state.hasOwnProperty(this.id)) {
      return this.state[this.id].find((item) => item.hash === hash);
    }

    this.state[this.id] = [];
    return false;
  }

  /**
   * @param {IHistoryEntry} item
   */
  add(item) {
    if (this.state.hasOwnProperty(this.id)) {
      this.state[this.id] = [item, ...this.state[this.id]].slice(
        0,
        MAX_TRANSACTION_HISTORY
      );
    }

    this._update();
  }

  /**
   * @param {IHistoryEntry} item
   */
  update(item) {
    if (this.state.hasOwnProperty(this.id)) {
      const itemToUpdate = this.state[this.id].find(
        ({ hash }) => item.hash === hash
      );

      itemToUpdate.status = item.status;
    }

    this._update();
  }

  /**
   *
   * @param {number} [page]
   * @param {number} [offset]
   * @returns
   */
  get(page = 1, offset = 6) {
    if (this.state.hasOwnProperty(this.id)) {
      const list = this.state[this.id];
      const data = list.slice((page - 1) * offset, page * offset);

      return {
        data,
        maxPage: Math.ceil(list.length / offset),
      };
    }
    return {
      data: [],
      maxPage: 1,
    };
  }

  getAllPending() {
    if (this.state.hasOwnProperty(this.id)) {
      return this.state[this.id].filter(
        (item) => item.status === STATUS.PENDING
      );
    }

    return [];
  }

  clear() {
    if (this.state.hasOwnProperty(this.id)) {
      this.state[this.id] = [];
    }

    this._update();
  }
}

export const LSHistory = new LSHistoryClass();

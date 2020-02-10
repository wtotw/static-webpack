'use strict';

export default class CountLog {
  /**
   * パラメータのセット
   */
  set () {
    this.eventType = null;
    this.CNTLOG = {
      // 画像へのリクエストパス
      PATH: '/pcstorage/img/cntlog/',
      // クラス名が取得できないため、画面パスの最初の「/」を抜いて「.」区切りで出力...「/sample/sample→sample.sample」
      ctlName: this._createCtl(),
      // 仕込んだ箇所
      label: null
    };
  }

  /**
   * クリック時のカウント、画面遷移を実行します。下記の順に直列実行されます。
   * URLの指定がない場合、画面遷移イベントは中止されます。
   * 1. カウントログ実行
   * 2. _gaq.push()実行
   * 3. 画面遷移
   *
   * @param {Object} 引数
   */
  click (options) {
    this.set();
    this.eventType = 'click';
    // 必須パラメータのチェック
    if (!this._validate(options)) {
      return false;
    }
    // 実行
    this._exec(options);
  }

  /**
   * imp時のカウント、画面遷移を実行します。下記の順に直列実行されます。
   * 1. カウントログ実行
   * 2. 画面遷移
   *
   * @param {Object} 引数
   */
  imp (options) {
    this.set();
    this.eventType = 'imp';
    // 必須パラメータのチェック
    if (!this._validate(options)) {
      return false;
    }
    // 実行
    this._exec(options);
  }

  /**
   * 実行します
   *
   * @param {Object} options 呼び出し元で指定した引数
   */
  _exec (options) {
    this._countLog(options.cntlog).then(this._move(options.link));
  }

  /**
   * ctlパラメータを作成します。
   * ※jsp側に揃えてディレクトリ構成での出力ができないため、pathの「/」を「.」に変更して出力します
   *
   * @return {String} 例)「/spot/auwallet/store」リクエストの場合の出力は「ctl=spot.auwallet.store」
   */
  _createCtl () {
    return location.pathname.slice(1).replace(/\//g, '.');
  }

  /**
   * 指定URLに画面遷移します。
   *
   * @param {object} link リンクオブジェクト
   * @returns {object} Promise
   */
  _move (link) {
    return new Promise((resolve, reject) => {
      // 早期リターン
      if (!link || !link.url) {
        return resolve();
      }

      try {
        if (link.target) {
          window.open(link.url);
          return resolve();
        } else {
          location.href = link.url;
          return resolve();
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * カウントログを発行します。
   * ctlパラメータは自動で発行されます
   *
   * @param {Object} objects  カウントログに付与したいパラメータを詰めたjsonオブジェクト
   *  例) { 'key1' : 'value1', 'key2' : 'value2' }
   * @return {Object}
   */
  _countLog (objects) {
    return new Promise((resolve, reject) => {
      // 早期リターン
      if (!objects) {
        return resolve();
      }

      try {
        const path = `${this.CNTLOG.PATH}${new Date().getTime()}`;
        const query = this._createQuery(objects);
        const url = `${path}?ctl=${this.CNTLOG.ctlName}&event=${this.eventType}&${query}`;
        const img = new Image();
        img.src = url;
        return resolve();
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * 任意クエリを作成します
   *
   * @param  {Object} キーバリュー(key1=value1&key2=value2... に変換したいkeyとvalue)のjsonオブジェクト
   *  例) { 'key1' : 'value1', 'key2' : 'value2' }
   * @return {String} query クエリ文字列
   */
  _createQuery (hash) {
    let query = '';
    if (hash) {
      for (const key in hash) {
        query += `${key}=${hash[key]}&`;
      }
    }
    // 末尾チェック
    if (query.slice(-1) === '&') {
      query = query.slice(0, -1);
    }
    return query;
  }

  /**
   * 引数チェック
   * @param {Object} 呼び出し元で指定した引数
   * @return {boolean} true: OK, false: NG
   */
  _validate (options) {
    // 引数が指定されているか
    if (!options) {
      return false;
    }
    // 引数のオブジェクトの第一階層のキーに必要項目以外のキー指定されていないかどうか
    const keys = Object.keys(options);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== 'link' && keys[i] !== 'cntlog') {
        return false;
      }
    }
    // カウントログを出力する場合、必須パラメータ「label」が設定されているか
    // 「ctl」,「event」は自動挿入するためチェック不要
    if (this.eventType && this.eventType === 'click') {
      const cntlogKeys = Object.keys(options.cntlog);
      if (cntlogKeys.indexOf('label') === -1) {
        return false;
      }
    }
    return true;
  }
}

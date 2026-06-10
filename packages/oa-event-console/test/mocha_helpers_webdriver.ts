//
// Copyright (C) 2023, Open Answers Ltd http://www.openanswers.co.uk/
// All rights reserved.
// This file is subject to the terms and conditions defined in the Software License Agreement.
//

// WebDriver Mocha Helper

// Webdriver.io and mocha helpers.
// Provide a singleton client for many tests to use
// Provide a screenshot function
// Provide browser compatibility functions

const debug = require('debug')('oa:test:helpers:webdriver');
const _ = require('lodash');
const { remote } = require('webdriverio');

class WebDriver {
  static browser_client: any = null;
  static browser = process.env.BROWSER || 'firefox';
  static browser_client_authenticated: any = null;

  static screen_shot_path(file: string) {
    return require('path').join(__dirname, 'screenshots', file);
  }

  // WaitUntil can use this
  static waitForText(cli: any, selector: string, test: any) {
    return (function (cli: any, selector: string, test: any) {
      debug('wait for text [%s]', selector);
      return cli
        .$(selector)
        .getText()
        .then(function (text: string) {
          debug('waited for [%s] [%s]', text, selector);
          if (_.isFunction(test)) {
            const ret = test(text);
            debug('waited for [%s] test returned [%s]', text, ret);
            return ret;
          } else {
            debug('test result [%s]', text === test, text, test);
            return text === test;
          }
        });
    })(cli, selector, test);
  }

  static waitForValue(cli: any, selector: string, test: any) {
    return (function (cli: any, selector: string, test: any) {
      debug('wait for value [%s]', selector);
      return cli
        .$(selector)
        .getValue()
        .then(function (value: any) {
          debug('waited 50 for [%s]', value, selector);
          if (_.isFunction(test)) {
            return test(value);
          } else {
            debug('waited 50 for [%s]', value, selector);
            return value === test;
          }
        });
    })(cli, selector, test);
  }

  static browser_css_weight_bold() {
    return this.browser === 'firefox' ? 700 : 'bold';
  }

  static browser_css_weight_normal() {
    return this.browser === 'firefox' ? 400 : 'normal';
  }

  // This should support more options than just the $BROWSER env var
  // Phantom needs ports
  static browser_capabililties() {
    const o: any = {
      capabilities: {
        browserName: this.browser,
      },
    };

    switch (this.browser) {
      case 'phantom':
        o.host = 'localhost';
        o.port = 9514;
        break;
      case 'ie':
        o.host = '192.168.60.10';
        o.port = 5555;
        o.capabilities.ignoreProtectedModeSettings = true;
        break;
    }

    if (process.env.BROWSER_PORT) {
      o.port = process.env.BROWSER_PORT;
    }
    if (process.env.BROWSER_HOST) {
      o.host = process.env.BROWSER_HOST;
    }

    debug('generated capabilities', o);
    return o;
  }

  static fetch_client(cb: Function) {
    const self = this;
    debug('browser_client before check', this.browser_client);
    if (this.browser_client) {
      cb(null, this.browser_client);
      return this.browser_client;
    }

    debug("fetch_browser_client didn't find one, creating new");

    remote(WebDriver.browser_capabililties()).then(function (client: any) {
      self.browser_client = client;
      cb(null, client);
      debug('browser_client after init', self.browser_client);
    });
  }

  static fetch_authenticated_client(web: any, cb: Function) {
    const self = this;
    if (this.browser_client_authenticated) {
      cb(null, this.browser_client_authenticated);
      return this.browser_client_authenticated;
    }

    this.fetch_client(function (err: any, cli: any) {
      if (err) {
        return cb(err);
      }
      cli
        .deleteCookies()
        .then(() => cli.url(web.url + '/login'))
        .then(() => cli.$('#form-public-login').waitForExist({ timeout: 2000 }))
        .then(() => cli.$('input[name=username]').setValue(web.username))
        .then(() => cli.$('input[name=password]').setValue(web.password))
        .then(() => cli.$('#form-public-login button[type=submit]').click())
        .then(() => cli.getTitle())
        .then(function (title: string) {
          let err2: Error | null = null;
          if (title !== 'Dashboard') {
            err2 = new Error(`Title isn't Dashboard [${title}]`);
          }
          self.browser_client_authenticated = cli;
          cb(err2, self.browser_client_authenticated);
        })
        .catch(cb);
    });
  }
}

module.exports = {
  WebDriver,
  remote,
};

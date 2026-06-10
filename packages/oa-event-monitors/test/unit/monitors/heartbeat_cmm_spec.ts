//
// Copyright (C) 2026, Open Answers Ltd http://www.openanswers.co.uk/
// All rights reserved.
// This file is subject to the terms and conditions defined in the Software License Agreement.
//

process.env.NODE_ENV = 'test';

const { expect, sinon } = require('../../mocha_helpers');
const nconf = require('nconf');
const { Agent } = require('../../../lib/heartbeat_cmm');

describe('Unit::EventMonitors::heartbeat_cmm::Agent', function () {
  let nconf_values: Record<string, any>;
  let nconf_stub: any;

  beforeEach(function () {
    nconf_values = {};
    nconf_stub = sinon.stub(nconf, 'get').callsFake((key: string) => nconf_values[key]);
  });

  afterEach(function () {
    nconf_stub.restore();
  });

  function runStart(overrides: Record<string, any> = {}): { cb_err: any; event: any } {
    Object.assign(nconf_values, overrides);
    let event: any = null;
    let cb_err: any = 'not-called';
    const a = new Agent({
      props: {},
      eventCB: function (obj: any) {
        event = obj;
      },
    });
    a.start(function (err: any) {
      cb_err = err;
    });
    return { cb_err, event };
  }

  describe('happy path', function () {
    it('invokes eventCB with hostname, mtype, alert_time (Date) and a single-line message', function () {
      const { event, cb_err } = runStart({
        client: 'server-a',
        mtype: '42',
        message: 'it happened',
      });

      expect(cb_err).to.equal(null);
      expect(event.hostname).to.equal('server-a');
      expect(event.mtype).to.equal('42');
      expect(event.alert_time).to.be.instanceof(Date);
      expect(event.lines).to.deep.equal(['it happened']);
      expect(event.message_0).to.equal('it happened');
    });

    it('splits a multi-line message into message_<n> keys and a lines array', function () {
      const { event } = runStart({
        client: 'host-b',
        mtype: '7',
        message: 'first line\nsecond\nthird',
      });

      expect(event.lines).to.deep.equal(['first line', 'second', 'third']);
      expect(event.message_0).to.equal('first line');
      expect(event.message_1).to.equal('second');
      expect(event.message_2).to.equal('third');
    });
  });

  describe('defaults when nconf keys are missing', function () {
    it('falls back to oaec_missing_client when client is not set', function () {
      const { event } = runStart({ mtype: '1', message: 'x' });
      expect(event.hostname).to.equal('oaec_missing_client');
    });

    it('falls back to oaec_missing_mtype when mtype is not set', function () {
      const { event } = runStart({ client: 'host', message: 'x' });
      expect(event.mtype).to.equal('oaec_missing_mtype');
    });

    it('falls back to oaec_missing_message when message is not set', function () {
      const { event } = runStart({ client: 'host', mtype: '1' });
      expect(event.lines).to.deep.equal(['oaec_missing_message']);
      expect(event.message_0).to.equal('oaec_missing_message');
    });
  });
});

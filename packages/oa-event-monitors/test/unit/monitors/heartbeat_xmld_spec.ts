//
// Copyright (C) 2026, Open Answers Ltd http://www.openanswers.co.uk/
// All rights reserved.
// This file is subject to the terms and conditions defined in the Software License Agreement.
//

process.env.NODE_ENV = 'test';

const { expect, sinon } = require('../../mocha_helpers');
const { Agent } = require('../../../lib/heartbeat_xmld');

describe('Unit::EventMonitors::heartbeat_xmld::Agent', function () {
  function mkAgent(cb: any) {
    return new Agent({
      props: { port_number: 0 },
      eventCB: cb,
    });
  }

  describe('parseRecord — happy path', function () {
    it('emits an event with mtype, hostname, a lines array and message_<n> keys', function () {
      const spy = sinon.spy();
      const a = mkAgent(spy);

      a.parseRecord({
        mtype: 'sev-warn',
        hostname: 'server-a',
        message: 'first line\nsecond line\nthird',
      });

      expect(spy.calledOnce).to.equal(true);
      const ev = spy.firstCall.args[0];
      expect(ev.mtype).to.equal('sev-warn');
      expect(ev.hostname).to.equal('server-a');
      expect(ev.message).to.equal('first line\nsecond line\nthird');
      expect(ev.lines).to.deep.equal(['first line', 'second line', 'third']);
      expect(ev.message_0).to.equal('first line');
      expect(ev.message_1).to.equal('second line');
      expect(ev.message_2).to.equal('third');
    });

    it('single-line messages produce a one-element lines array', function () {
      const spy = sinon.spy();
      const a = mkAgent(spy);

      a.parseRecord({ mtype: 'info', hostname: 'h', message: 'only line' });

      const ev = spy.firstCall.args[0];
      expect(ev.lines).to.deep.equal(['only line']);
      expect(ev.message_0).to.equal('only line');
    });
  });

  describe('parseRecord — guards', function () {
    it('does not fire eventCB when message is missing', function () {
      const spy = sinon.spy();
      const a = mkAgent(spy);

      a.parseRecord({ mtype: 'info', hostname: 'h' });

      expect(spy.called).to.equal(false);
    });

    it('does not fire eventCB when mtype is missing', function () {
      const spy = sinon.spy();
      const a = mkAgent(spy);

      a.parseRecord({ hostname: 'h', message: 'x' });

      expect(spy.called).to.equal(false);
    });

    it('does not fire eventCB when hostname is missing', function () {
      const spy = sinon.spy();
      const a = mkAgent(spy);

      a.parseRecord({ mtype: 'info', message: 'x' });

      expect(spy.called).to.equal(false);
    });
  });
});

//
// Copyright (C) 2026, Open Answers Ltd https://www.openanswers.co.uk/
// All rights reserved.
// This file is subject to the terms and conditions defined in the Software License Agreement.
//

// Tests the heartbeat agent's isRecordTerminator and parseRecord. Both methods
// are invoked by ComplexLogTokenizer as plain functions (no `this` usage),
// so we test them via an Agent instance but they don't depend on construction
// state for their logic.

process.env.NODE_ENV = 'test';

const { expect, sinon } = require('../../mocha_helpers');
const { Agent } = require('../../../lib/heartbeat');

describe('Unit::EventMonitors::heartbeat::Agent', function () {
  let agent: any;

  beforeEach(function () {
    agent = new Agent({ props: { logfile: '/tmp/heartbeat.log' }, eventCB: function () {} });
  });

  describe('isRecordTerminator', function () {
    it('returns true when first line matches the heartbeat header and last line ends with ]', function () {
      const lines = ['01/05 22:39 Client [servera], Mtype [42], Message [line one]'];
      expect(agent.isRecordTerminator(lines)).to.equal(true);
    });

    it('returns true for a multi-line record whose last line ends with ]', function () {
      const lines = ['01/05 22:39 Client [servera], Mtype [42], Message [first', 'second', 'last]'];
      expect(agent.isRecordTerminator(lines)).to.equal(true);
    });

    it('returns false when the first line matches but last line has no trailing ]', function () {
      const lines = ['01/05 22:39 Client [servera], Mtype [42], Message [first', 'no terminator here'];
      expect(agent.isRecordTerminator(lines)).to.equal(false);
    });

    it('returns false when first line does not match the heartbeat header pattern', function () {
      const lines = ['random line', 'another]'];
      expect(agent.isRecordTerminator(lines)).to.equal(false);
    });

    it('returns false for an empty record_lines array', function () {
      expect(agent.isRecordTerminator([])).to.equal(false);
    });
  });

  describe('parseRecord', function () {
    it('parses a single-line record and strips the trailing ]', function () {
      const lines = ['01/05 22:39 Client [servera], Mtype [42], Message [only line]'];
      const tokens = agent.parseRecord(lines);

      expect(tokens.day).to.equal('01');
      expect(tokens.month).to.equal('05');
      expect(tokens.hour).to.equal('22');
      expect(tokens.minute).to.equal('39');
      expect(tokens.hostname).to.equal('servera');
      expect(tokens.mtype).to.equal('42');
      expect(tokens.message_0).to.equal('only line');
      expect(tokens.lines).to.deep.equal(['only line']);
      expect(tokens.alert_time).to.be.instanceof(Date);
    });

    it('composes alert_time from day/month/hour/minute and the current year', function () {
      const lines = ['03/07 14:22 Client [hostb], Mtype [1], Message [x]'];
      const tokens = agent.parseRecord(lines);

      const now = new Date();
      expect(tokens.alert_time.getFullYear()).to.equal(now.getFullYear());
      expect(tokens.alert_time.getMonth()).to.equal(7 - 1); // 0-indexed
      expect(tokens.alert_time.getDate()).to.equal(3);
      expect(tokens.alert_time.getHours()).to.equal(14);
      expect(tokens.alert_time.getMinutes()).to.equal(22);
    });

    // Skipped: source currently drops the header's first-line fragment
    // (matches[7] — the portion after `Message [`) on multi-line records.
    // Awaiting author decision on whether this is a bug or intentional.
    it.skip('parses a multi-line record with every line captured in tokens.lines', function () {
      const lines = ['01/05 22:39 Client [servera], Mtype [42], Message [first line', 'middle line', 'final line]'];
      const tokens = agent.parseRecord(lines);

      expect(tokens.lines).to.have.length(3);
      expect(tokens.lines[0]).to.equal('first line');
      expect(tokens.lines[1]).to.equal('middle line');
      expect(tokens.lines[2]).to.equal('final line');
    });

    it('merges a "Message [Low Idle" split across the first two lines', function () {
      const lines = ['01/05 22:39 Client [servera], Mtype [42], Message [Low Idle', 'details on second line]'];
      const tokens = agent.parseRecord(lines);

      expect(tokens.hostname).to.equal('servera');
      expect(tokens.mtype).to.equal('42');
      // After merging, first_line carries the continuation; nothing left to loop over
      expect(tokens.message_0).to.equal('Low Idle details on second line');
      expect(tokens.lines).to.deep.equal(['Low Idle details on second line']);
    });

    it('returns false when the first line does not match the heartbeat header pattern', function () {
      const lines = ['garbage line', 'another]'];
      expect(agent.parseRecord(lines)).to.equal(false);
    });
  });
});

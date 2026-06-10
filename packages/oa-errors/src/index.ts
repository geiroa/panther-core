// @ts-nocheck
//
// Copyright (C) 2023, Open Answers Ltd http://www.openanswers.co.uk/
// All rights reserved.
// This file is subject to the terms and conditions defined in the Software License Agreement.
//

const { throw_a } = require('./helpers');

const errors = require('./errors');

errors.throw_a = throw_a;

module.exports = errors;

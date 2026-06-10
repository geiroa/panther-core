/*
 * Copyright (C) 2023-2026, Open Answers Ltd https://www.openanswers.co.uk/
 * All rights reserved.
 * This file is subject to the terms and conditions defined in the Software License Agreement.
 */

db.externalclasss.remove({});

// Identifier
db.externalclasss.save({
  class_name: 'oatime',
  trigger_name: 'new_oatime',
  command: '/raid/oaec/external/new_oatime.sh',
});

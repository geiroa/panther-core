# Panther 5.0.4
  ## Changes
  - Source migrated from CoffeeScript to TypeScript across all packages
  - Frontend build moved from Grunt + connect-assets + Bower to Vite 6 / esbuild
  - Test stack moved to Mocha 11 + Chai 5 + Sinon 19; Playwright added for e2e,
    Vitest for UI, c8 for coverage, mongodb-memory-server for integration
  - Minimum Node raised from 16 to 24 (engines: ^24.0.0); Docker base images now
    node 24.15.0 (alpine3.23 runtime/builder, trixie-slim tester)
  - Workspace tooling moved from yarn/lerna bootstrap to npm workspaces; Lerna 7 → 9

  ## NPM dependencies (production)
  - express@5.0.1 (from 4.17)
  - mongoose@6.13.6 (from 5.13.20)
  - passport@0.7.0 (from 0.3.2)
  - passport-local-mongoose@9.0.1 (from 5.0.1)
  - passport.socketio@3.7.0 (from 3.6.1)
  - nodemailer@8.0.5 (from 6.7.7)
  - socket.io@4.7.5 (from 4.7.1)
  - express-session@1.19.0 (from 1.17.3)
  - body-parser@1.20.3
  - glob@10.5.0 (from 7)
  - less@4.2.1 (from 2.5)
  - uuid@11 (replaces node-uuid; uuid 3 → 11)
  - farmhash@5.0.1 (from 2.1)
  - libxmljs2@0.37.0 (replaces libxmljs@1.0.11)
  - @xmldom/xmldom@0.9.10 (from 0.7.7)
  - tmp@0.2.5 (from 0.0.28)
  - underscore@1.13.8, lodash@4.18.1, js-yaml@3.14.2
  - Front-end libs now npm-managed (previously Bower): bootstrap, bootstrap-3-typeahead,
    jquery, jquery-ui, d3, clipboard, file-saver, mustache, timeago, urijs
  - Removed: connect-assets, coffeescript/coffee-script, node-uuid

  ## NPM dependencies (dev/tooling)
  - typescript@5.7.3, tsx, ts-node added; coffeescript/docco removed
  - vite@6, vitest@4, @vitest/ui, esbuild
  - @playwright/test@1.59, mongodb-memory-server@10, jsdom
  - mocha@11 (from 9.2), chai@5 (from 3/4), sinon@19 (from 1.x)
  - c8@11 coverage; prettier@3.6 + @trivago/prettier-plugin-sort-imports
  - eslint@8.57, eslint-plugin-n (replaces eslint-plugin-node)
  - Removed: grunt + grunt-*, bower, webdriverio, casperjs/phantomjs/selenium, jshint, coffeelint, request, benchmark, blanket

# Panther 4.1.6

- Additional logfile for capturing http-monitors event payload

# Panther 4.1.3

## Changes
- Docker base images updated to node 18 alpine3.18

## NPM dependencies
- socket.io@4
- lerna@7
- minimist@1.2.8
- tough-cookie@4.1.3

# Panther 4.1.2

## Changes
- when creating a rule in the gui it would be nice for a new tab to be opened
- `external_id` added as a defualt column

## NPM dependencies
- migrate-mongo@10.0.0

# Panther 4.1.1

## Fixes

- Parse errors in rule imports are exposed to the client.
- Groups drop down menu has scrollbar added.
- Dashboard stacked charts styling.
- Disallow rule imports with no changes.
- http monitor API responds only once.
- event-rules schedule checking uses TZ.
- `server.rules.yml` validation is tightened up.

## Changes
- Added Dashboard activity when `server.rules.yml` is imported.
- Added git commit message when importing rules
- Docker base images updated to alpine3.17

## NPM dependecies
- lerna@6.3.0
- xmldom -> @xmldom/xmldom@0.7.7
- minimist@1.2.7


# Panther 4.1.0

Below are the significant changes from the previous release [4.0.10](https://github.com/OpenAnswers/panther-core/tree/4.0.10)

## NodeJS requirements (Source builds)

Have changed from 12.x to 16.x

## MongoDB requirements (Source builds)

Have changed from 3.2.x to 3.6.23


## NPM dependencies

Many package dependencies have been updated, the minimum versions depended upon are:

- base64-url (removed)
- ejs (removed)
- mem (removed)
- shelljs (removed)
- showdown (removed)
- constantinople@4.0.1
- growl@1.10.5
- nconf@0.12.0
- underscore@1.12.1
- tough-cookie@2.3.4
- moment@2.29.4
- js-yaml@3.14.1
- marked@4.0.18
- bower@1.8.14
- bson@1.1.6
- pathval@1.1.1
- mongodb@3.5.9
- diff@5.0.0
- qs@2.3.3
- minimatch@3.0.8
- hawk@6.0.2
- nodemailer@6.7.7
- bl@1.2.3
- yargs-parser@13.1.2
- tunnel-agent@0.6.0
- request@2.83.0
- hoek@4.2.1
- highlight.js@11.3.1

## Fixes

- Cleared events are now deleted.
- Email addresses are handled case insensitive.
- When rules are tracked in git, the user's email address is used for the commit.
- When adding an `external_id`, the `owner` field is no longer updated.

## Fixes (rules)

### select equals (rules)

Matches on one __OR__ many values

#### One (equals)
```
    - name: eq1
      set:
        owner: one of RFC
      equals:
        agent: Syslog RFC5424
```

#### Many (equals)
```
    - name: eq1
      set:
        owner: one of RFC
      equals:
        agent:
          - Syslog RFC5424
          - Syslog RFC3164
```

## Changes

More fields are accessible within agent rules using a `input.` prefix as shown below.

### Agent HTTP

HTTP agent rules can access top level keys within the `event: {...}` JSON data.

Sending an Event via the curl command (copied from `/apiconsole`): 
```
curl -X POST -H 'X-Api-Token: <APIKEY>' -H 'Content-Type: application/json' \
  -d '{"event": { "node": "localhost", "tag": "mytag", "summary": "event summary goes here", "severity": 1, "extra": "some more data", "another_extra": "even more data", "owner": "account id..." }}' \
   'http://<HOSTNAME>:<PORT>/api/event/create'
```

Will make available the following fields in the agent rules:

| Field               | Value                   |
| ------------------- | ----------------------- |
| node                | localhost               |
| tag                 | mytag                   |
| summary             | event summary goes here |
| severity            | 1                       |
| input.extra         | some more data          |
| input.another_extra | even more data          |
| input.owner         | account id...           |



e.g.
```yaml
      - name: input data has extra stuff AND has an owner
        equals:
          input.extra: some more data
        field_exists:
          - input.owner
        set:
          tag: 'extra: {input.extra}'
          owner: '{input.owner}'
```

### Agent Syslog

Syslog Agent rules + Server rules, now parse and accept the newer RFC5424 message format.

RFC3164 and RFC5424 can be differentiated with a rule in `syslog.rules.yml`, that inspects the value of `input.type`

e.g.
```yaml
      - name: This is a Syslog RFC3164 message
        eq:
          input.type: RFC3164
        set:
          summary: 'This message was formatted as RFC3164'
          agent: 'Syslog {input.type}'

      - name: This is a Syslog RFC5424 message
        eq:
          input.type: RFC5424
        set:
          summary: 'This message was formatted as RFC5424'
          agent: 'Syslog {input.type}'
          external_id: '{input.msgID}'
```

#### RFC5424 specifics

Decoding of sd-id and sd-param is done as follows

```code
<148>1 2022-05-17T16:31:01.326287+01:00 laptop username - - [timeQuality tzKnown="1" isSynced="1" syncAccuracy="674500"][zoo@123 thread="hungry" priority="high"][appName@2 bob="bob3"] syslog had something to say
```

Translates to following variables that can be referenced in `syslog.rules.yml` either as fields, or as values when enclosed in `{}`

```
input.structuredData.timeQuality.tzKnown = "1"
input.structuredData.timeQuality.isSynced = "1"
input.structuredData.timeQuality.synAccuracy = "674500"
input.structuredData.zoo@123.thread = "hungry"
input.structuredData.zoo@123.priority = "high"
input.structuredData.appName@2.bob = "bob3"
```


Ways to use from Rules/Syslog

```console
Select events where...

The field input.structuredData exists

Then...

Set the value of summary to 'tzKnown was: {input.structuredData.timeQuality.tzKnown}'
```

The above is represented as the syslog agent rule:
```yaml
  rules:
    - name: Check for RFC5424 structured data and set a summary
      field_exists: input.structuredData
      set:
        summary: 'tzKnown was: {input.structuredData.timeQuality.tzKnown}'
```

Sending RFC5424 messages to Panther can be accomplished with a modern version of `logger`.


```console
logger -p local2.warn -n <HOSTNAME> -T -P 1514 --rfc5424 -t my-tag-goes-here --msgid 123 --id=44 --sd-id test@123 --sd-param my-param=\"my-params-value\" The summary message is everything else
```

*NOTE*: CentOS 7 does not support RFC5424, if you have Docker available you can wrap the above command within a container
```console
docker run debian logger -p local2.warn -n <HOSTNAME> -T -P 1514 --rfc5424 -t my-tag-goes-here --msgid 123 --id=44 --sd-id test@123 --sd-param 'my-param="my-params-value"' The summary message is everything else
```

  When using a temporary Docker container the `<HOSTNAME>` will be resolved from within the container, so `localhost` would refer to the container itself.  Make sure to use proper hostnames 

# dev: sources of main.js

`main.js` in the repo root is built from the parts here (header, neutral data, EN/RU texts, core):
`sh dev/build.sh` assembles `new-main.js`, runs both test suites on an Obsidian mock and copies the result to `../main.js`.

- `neutral.js`: language-neutral data (categories, exercises with tier/src/band/bar/gear/neck/jerk flags, program)
- `en.js` / `ru.js`: exercise and day texts (RU = user's own document `tech-ru.txt` for techniques)
- `old-main.js`: pre-i18n build, used by the tests to check that Russian texts did not change

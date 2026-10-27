# GitHub Virtual Universe '26 event site

Public event site for the hands-on exercises in
[octodemo/virtual-universe-26](https://github.com/octodemo/virtual-universe-26).

The site uses the approved light-mode Primer Brand design from the
[Universe hands-on prototype](https://github.com/github/site-generator/tree/a7d6886a1b7936db06c9a838026877cae2ac24d0/prototypes/universe-hands-on-light).
The page source and its local demo assets live in `src/prototype/`.

## Local development

Use Node.js 24 or later:

```sh
npm ci
npm run dev
```

Open <http://127.0.0.1:5173/virtual-universe-26/>.

## GitHub Pages

Keep the deployable `index.html` and generated `assets/` at the repository root
for the existing GitHub Pages branch-root deployment. Run `npm run build`
before publishing changes; Vite writes the production entry point and bundles
to those root paths. The configured `/virtual-universe-26/` base keeps asset
URLs working on the project's GitHub Pages URL.

After resolving merge conflicts, rebuild from the merged source rather than
choosing one branch's generated HTML or bundles. The **Check Pages build** workflow
verifies that committed root output matches the source, including after merges.
This check does not deploy the site.

# Nutrition runtime 475: modular official IFCT tables

The nutrition loader now reads the frozen v473 master plus nine separate IFCT
supplements. It validates the complete set before attaching rows to profiles by
IFCT food code. A missing or invalid supplement leaves the original verified
master available, with a visible warning and no partially merged tables.

`fssai-product-helper-preview-01/data/nutrition-db-v1.json` is unchanged:

- Git blob: `8eda506e6083089173ede637560a89ad69dc1be9`
- SHA-256: `0d4006f9509f1375d51dd876021441fd06731a9e9cfec9429abf572c773d0342`
- 528 active IFCT profiles, seven locked starter profiles and 14 oil references.

## Source and table boundaries

The supplements are compiled from the user-provided original ICMR-NIN
`IFCT2017.pdf`, SHA-256
`7fc5a5112a57240d25bf695dca82cccd8d93ed54e8c39530e42b5ad1820d0e8c`.
The official source link is
<https://www.nin.res.in/ebooks/IFCT2017_16122024.pdf>.
Page numbers below are physical PDF pages, including front matter.

| Table | Composition | PDF pages | Unique food rows | Fields | Bytes |
| --- | --- | --- | ---: | ---: | ---: |
| 4 | Carotenoids | 131–147 | 329 | 8 | 133194 |
| 5 | Minerals and trace elements | 151–206 | 528 | 20 | 350017 |
| 6 | Starch and individual sugars | 209–224 | 314 | 7 | 115795 |
| 7 | Fatty acids and cholesterol | 227–294 | 528 | 29 | 615278 |
| 8 | Amino acids | 297–361 | 528 | 18 | 333784 |
| 9 | Organic acids | 364–381 | 314 | 10 | 167781 |
| 10 | Polyphenols | 384–451 | 314 | 38 | 679218 |
| 11 | Oligosaccharides, phytosterols, phytates and saponins | 454–471 | 314 | 9 | 143185 |
| 12 | Edible oil and fat profiles | 474–475 | 14 | 22 | 14098 |

The earlier Tables 6–12 ZIP used incorrect extraction boundaries. Its Table 12
text contained Table 11 rows, so it was not used to compile these modules.

## Missing values and source limitations

Every row retains printed cell text and physical PDF page references. Printed
means are stored as numbers; the printed standard deviation remains in the raw
evidence. Blank cells stay `null` with `below_detection` reasons. Fields absent
from a panel stay `null` with `not_reported` reasons. Conflicting or unparseable
observations would remain `null` with an `unresolved` reason. There are no
unresolved numeric observations in this compilation.

The supplied PDF contains no essential-amino-acid panel for M001–M015 and
N001–N004. Those 190 cells remain unavailable. Repeated marine amino-acid pages
are merged only when their printed means agree. The marine abbreviation `ASN`
is mapped to aspartic acid because the full printed heading says "Aspartic
Acid"; the printed `LE` heading is leucine. Split polyphenol headings are
recognized from their words and coordinates. Inconsistent regional sample
counts are retained per page; their combined count is `null`.

Tables 4–7 and 9–11 use quantities per 100 g edible portion. Table 5 uses µg for
arsenic, mercury and selenium, and mg for its other fields. Table 11 retains
its mixed g/mg units. Table 8 is **g per 100 g protein**. Table 12 is **percent
of total fatty-acid methylesters**. Tables 8 and 12 are reference-only and
cannot enter food-mass aggregation without a separate compatible conversion.

Existing master fields and label-field verification flags are preserved.
Supplemental values appear in the additional composition panel. Missing label
and Table 2 vitamin values now remain unavailable instead of being coerced to
zero. Explicit numeric zero remains valid.

## Validation and reproduction

The runtime checks source identity, basis, unit registry, row/field counts,
unique and expected codes, canonical food names, printed means and missing-value
reasons. It checks every module's SHA-256 and byte size before merging. All
modules are smaller than 800000 bytes. Master requests remain `?v=473`;
supplement, manifest and runtime-script requests use `?v=475`.

Generate the coordinate text and compile:

```sh
pdftotext -f 131 -l 475 -bbox-layout IFCT2017.pdf tables-bbox.html
python3 scripts/build-ifct-modules.py --pdf IFCT2017.pdf --bbox tables-bbox.html
node --test tests/nutrition-modules.test.cjs
```

All 30 tests pass, covering the actual complete module set, master preservation,
invalid codes/fields/units, altered or missing files, atomic fallback,
mass-weighted aggregation, reference-basis exclusion, null-versus-zero handling,
page rendering, index-loader status and complete synchronous application startup.
Live browser verification exposed a pre-existing startup error: the enzyme
selector read `appendixCDb` before its `let` initialization. Shared database state
is now initialized before any selectors or renderers run, so startup reaches
the nutrition and other database loaders. The runtime and inline application
JavaScript pass syntax checks. Representative original PDF pages were visually
inspected, including oil percentage units, split polyphenol headings and the
cholesterol panel.

Future corrections should change the affected module, regenerate its manifest
hash and size, run the tests, then bump the nutrition runtime version and its
cache queries together. A master-database upgrade also requires deliberately
updating the pinned master identity; this change does not rewrite that file.

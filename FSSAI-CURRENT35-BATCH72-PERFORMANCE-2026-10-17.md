# FSSAI Batch72: Faster conditional source-integrity checks — no gate removal

**17 October 2026. GitHub Pages FSSAI prototype on `gh-pages` only; WordPress production and `main` unchanged.**

## Reason for the optimization

The extended B23–B68 research workbench was successfully tested in Batch71, but its real-browser loading took approximately 195 seconds. Later `valid()` functions call the exact same already-validated ancestor repeatedly, magnifying the cost of the immutable 35-case source/lineage validation graph.

Batch72 removes **only transitive duplicate invocations** in eight validator modules B59, B60, B61, B63, B64, B66, B67, B68. The required predecessor is still checked; it itself verifies the entire ancestor chain. For instance, B68 -> B67 -> B66 -> B60 -> B59, so B68 does not need to validate B59 and B60 a second time; it still reads the B59 verified 35-case rows and verifies every case's original five requests, source pin and all false regulatory approval flags. B59 requires B58.valid(), which already requires B56, B57, and B57Plus validity. No input file, source digest, identity check, case dataset or approved status has changed.

## Controls and scope

- 533-product catalogue, 498 conditional source matches
- Original 35 HELD CTR cases (13 P0, 22 P1), original **175 unique evidence request IDs** unchanged
- No case-specific legal maxima approved, no accredited lab matrix signoff, no actual lot CoAs or passes, no releases or transmissions
- Explicit web research is still on demand, based on successful B22 startup
- Structural chain regression and real Chromium opt-in browser end-to-end tests required to consider the optimization verified
- Failing data or an in-memory mutated ancestor must still make the B59–B68 source decisions fail closed

CI timings are workload/environment dependent; measure improvement against Batch71's 195-second reference and do not claim a performance win without actual measurements.

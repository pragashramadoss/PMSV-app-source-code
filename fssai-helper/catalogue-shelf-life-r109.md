# R109 · Compare a lot with its approved shelf life

Open **Product finder → Product worksheet → Packaging, labelling and claims → Printed dates on the lot → Compare with the approved shelf life**.

1. Transcribe the two markings and identify the sample and SKU coding instruction.
2. Select the starting event named by the instruction (manufacture or packaging), the end marking (expiry/use-by or best before), the approved duration in days or calendar months, and the counting convention.
3. If the instruction starts from a different event than the printed one, enter the complete date from the lot record and its reference. This also lets you supply the day when the printed start gives only a month. When both sources describe the same event, any conflicting printed start stops the calculation.
4. Save the check or start another lot. The next lot inherits the SKU instruction. Enter the new lot code, sample reference and dates. The per-lot CSV, product brief and full register include the expected date and comparison.

| Example coding instruction | Expected date |
| --- | --- |
| Packed 01 April 2026, 30 days, add the full duration | 01 May 2026 |
| Same start and duration, count packing day as day one | 30 April 2026 |
| Packed 31 January 2028, one calendar month, add the full duration, use the target month’s last day | 29 February 2028 |
| Same lot, with an instruction to carry excess days forward | 02 March 2028 |

The worksheet asks for a month-end rule only when the calculation needs a decision. For calendar months it first applies the documented month-end convention, then subtracts one day if the instruction requires it. Use a manual review for another convention. A printed end month containing the expected day produces a month-level finding. The precise day remains undetermined.

## Scope of the finding

The expected date comes from the SKU instruction and the start date recorded for the lot. The calculation checks how the duration was applied. Establishing the safe shelf life itself requires separate product evidence. Format, expiry exemptions and small-pack placement have their own findings in the Helper. Where the validity of a date depends on special storage conditions, regulation 5(10)(c) addresses their declaration on the label. [FSSAI Labelling and Display Regulations, pp. 16–17](https://www.fssai.gov.in/docs/food-law/regulations/Comp_Labelling%20Display_Version%20VIII_09_09_2025.pdf#page=16)

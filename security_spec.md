# Security Specification for Spidey Jersey ERP

## 1. Data Invariants
- Products: Every product document must be accessible for reads to signed-in users, and writes restricted to authenticated users with valid data format.
- Orders: Every order document must have valid customer info, positive totalAmount, and status within valid OrderStatus values.

## 2. Dirty Dozen Payloads (Negative Tests)
1. Unauthenticated write to /products/p1
2. Unauthenticated write to /orders/o1
3. Product missing required fields (e.g. price)
4. Product with oversized name (>500 chars)
5. Product with negative price (< 0)
6. Order with negative totalAmount (< 0)
7. Order with invalid status string
8. Order with non-string customerName
9. Modifying document with malicious path Injection
10. Spoofed auth email without email verification
11. Unauthorized write to system collections
12. Shadow update attempting to modify system fields

## 3. Test Matrix
All 12 dirty payloads must evaluate to PERMISSION_DENIED in firestore.rules.

# Task ID: 7b - Payments, Promo Codes, Reviews, Captain Wallet APIs

## Work Summary
Created 10 API route files for Payments, Promo Codes, Reviews, and Captain Wallet functionality.

## Files Created
1. `/api/payments/route.ts` - GET (list with filters) + POST (create)
2. `/api/payments/[id]/route.ts` - GET (details) + PUT (update, admin only)
3. `/api/promo-codes/route.ts` - GET (list, customers see active only) + POST (create, admin only)
4. `/api/promo-codes/[id]/route.ts` - GET + PUT + DELETE (soft delete, admin only)
5. `/api/promo-codes/validate/route.ts` - POST (validate & apply promo code)
6. `/api/reviews/route.ts` - GET (list) + POST (create, customer only after delivery)
7. `/api/reviews/[id]/route.ts` - GET + PUT (customer updates rating, captain replies)
8. `/api/wallet/route.ts` - GET (captain wallet info with last 10 transactions)
9. `/api/wallet/withdraw/route.ts` - POST (request withdrawal)
10. `/api/wallet/transactions/route.ts` - GET (paginated transaction history)

## Key Features
- Role-based access control (Admin/Captain/Customer)
- Payment creation triggers wallet transactions for captain earnings
- Promo code validation with all checks (active, not expired, usage limits, min order)
- Captain rating auto-update (weighted average) on review create/update
- Notification integration for new reviews and withdrawal requests
- Arabic messages throughout
- ESLint: zero errors

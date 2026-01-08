# Shop & Merchandise

Product sales, orders, and volunteer credits.

---

## Product Categories

| Category | Examples |
|----------|----------|
| Apparel | Hats, t-shirts, polos, jackets |
| Accessories | Patches, stickers, decals |
| Targets | Paper targets, target stands |
| Gear | Club-branded bags, ear pro |

---

## Product Data

### Required Fields

| Field | Type | Notes |
|-------|------|-------|
| name | text | 1-100 chars |
| category | enum | See categories above |
| member_price | cents | Max $100,000 |
| inventory_count | integer | 0-99999 |
| active | boolean | Show in shop |

### Optional Fields

| Field | Type | Notes |
|-------|------|-------|
| description | rich text | Max 2000 chars |
| images | files | Up to 10, JPG/PNG/WebP |
| sizes | array | S, M, L, XL, etc. |
| variants | array | Colors, styles |

### Image Requirements

| Rule | Requirement |
|------|-------------|
| File types | JPG, PNG, WebP |
| Max size | 5MB |
| Dimensions | 800x800 min, 4096x4096 max |
| Aspect ratio | 1:1 recommended |
| Max per product | 10 images |

---

## Pricing

### Who Can Buy

| Buyer | Access |
|-------|--------|
| Visitor | Browse only, cannot purchase |
| Expired member | Cannot purchase |
| Active member | Member price |
| Life member | Member price |

---

## Checkout

### Payment

- Stripe payment processing
- Credit/debit cards
- Payment confirmation email

### Fulfillment Options

| Option | Description |
|--------|-------------|
| Pickup | Default, at range house |
| Shipping | Flat rate or calculated |

### Pickup Details

| Rule | Requirement |
|------|-------------|
| Location | Range house during open hours |
| Notification | Email + SMS + push when ready |
| Deadline | 30 days to pick up |
| Not picked up | Refunded minus 10% restocking |

---

## Order Management

### Order States

```
Created → Paid → Ready → Completed
                  ↓
              Shipped → Completed
         ↓
    Cancelled (before shipped)
         ↓
    Refunded (any time)
```

### Admin Actions

| Action | When |
|--------|------|
| Mark ready | Item available for pickup |
| Mark shipped | Enter tracking number |
| Mark complete | Picked up or delivered |
| Cancel | Before shipping |
| Refund | Any time (partial or full) |

---

## Inventory

### Behavior

| Event | What Happens |
|-------|--------------|
| Add to cart | Inventory not reserved |
| Checkout | Inventory checked |
| Out of stock at checkout | Item removed, user notified |
| Order cancelled | Inventory restored |
| Order refunded | Inventory restored |

### Low Stock

- Alert admin when stock ≤ 5
- Show "low stock" to customers when ≤ 10
- Show "out of stock" when 0

---

## Volunteer Credits

### Earning Credits

| Activity | Credit |
|----------|--------|
| 1 volunteer hour | $10 |
| Match director | $25 per match |
| RSO full day | $25 |
| Major project | $50 (admin discretion) |

### Using Credits

| Use | Allowed |
|-----|---------|
| Apply to dues | Yes |
| Shop purchases | Yes |
| Event fees | Yes |
| Transfer to another member | No |
| Cash out | No |

### Credit Rules

| Rule | Requirement |
|------|-------------|
| Expiration | March 31 (end of fiscal year) |
| Rollover | Not allowed |
| Balance display | Shown in dashboard |

### Verification

- Self-reported hours flagged "pending"
- Admin or event director verifies
- Only verified hours count toward credit

---

## Orders View (Member)

- Order history
- Order status tracking
- Download receipts
- Request refund (before shipping)

---

## Orders View (Admin)

- All orders list
- Filter by status, date, member
- Bulk status updates
- Export orders
- Refund processing

---

## Notifications

| Event | Who | Method |
|-------|-----|--------|
| Order placed | Member | Email |
| Order ready | Member | Email + SMS + Push |
| Order shipped | Member | Email with tracking |
| Refund issued | Member | Email |
| Low stock | Admin | Email |

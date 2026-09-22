# src/

React 19 + Vite finance tracker. Plain JSX, no TypeScript, no router, no state library.

## Component tree

```
main.jsx
└── App.jsx            owns `transactions` state + `categories`
    ├── Summary.jsx            props: transactions
    ├── TransactionForm.jsx    props: categories, onAddTransaction
    └── TransactionList.jsx    props: transactions, categories
```

## Architectural rulesv

**`App` is a thin container.** It owns exactly one piece of shared state
(`transactions`) plus the static `categories` list, and passes them down. It holds
no form state, no filter state, and computes no totals. New shared state belongs
here; anything a single child can own belongs in that child.

**State lives with the component that uses it.** `TransactionForm` owns its four
input fields; `TransactionList` owns its two filter selects. Neither lifts state up,
because nothing else reads it. `TransactionForm` communicates upward only through
the `onAddTransaction` callback, which it calls with a fully-formed transaction
object — `App` just appends it.

**Derived values are computed at the point of use, never stored.** `Summary`
recalculates `totalIncome` / `totalExpenses` / `balance` from the `transactions`
prop on every render; `TransactionList` derives `filteredTransactions` the same way.
There is no `useEffect` syncing totals into state, and there should not be — totals
that live in state drift from the list that produced them.

## Transaction shape

```js
{ id, description, amount, type, category, date }
```

**`amount` is always a `Number`, never a string.** This is load-bearing: the summary
reducers do `sum + t.amount`, so a string amount silently concatenates instead of
adding (`0 + "5000"` → `"05000"`). The `<input type="number">` in `TransactionForm`
yields a string, so it is converted with `Number(amount)` at the single point where
a transaction is constructed. Convert on the way *into* state, not at each read site.

`type` is `"income"` or `"expense"` and drives both the summary split and the
`income-amount` / `expense-amount` styling classes. `date` is an ISO `YYYY-MM-DD`
string. `id` is `Date.now()` for new rows and a small integer for the seed data.

## Persistence

None. `transactions` is seeded inline in `App.jsx` via `useState` and lives only in
memory — a page reload discards anything added. Any persistence work starts by
replacing that initializer.

## Styling

Global CSS in `App.css`, keyed off the class names in the JSX (`summary`,
`summary-card`, `add-transaction`, `transactions`, `filters`, `income-amount`,
`expense-amount`, `balance-amount`). No CSS modules, no styled-components — when
extracting a component, carry its class names over unchanged.

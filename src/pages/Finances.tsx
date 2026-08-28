import { ArrowDownCircle, ArrowUpCircle, Scale, Wallet } from "lucide-react";
import { Card } from "../components/Card";
import { StatCard } from "../components/StatCard";
import { SubscriptionList } from "../components/SubscriptionList";
import { TransactionList } from "../components/TransactionList";
import { monthKey } from "../lib/date";
import type { Subscription, Transaction } from "../types";

export function Finances({
  transactions,
  setTransactions,
  subscriptions,
  setSubscriptions,
}: {
  transactions: Transaction[];
  setTransactions: (updater: (prev: Transaction[]) => Transaction[]) => void;
  subscriptions: Subscription[];
  setSubscriptions: (updater: (prev: Subscription[]) => Subscription[]) => void;
}) {
  const thisMonth = monthKey();
  const monthTx = transactions.filter((t) => t.date.startsWith(thisMonth));
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const monthlySubTotal = subscriptions.reduce(
    (s, sub) => s + (sub.cycle === "monthly" ? sub.amount : sub.amount / 12),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Income this month" value={income.toLocaleString()} icon={ArrowUpCircle} />
        <StatCard
          label="Expense this month"
          value={expense.toLocaleString()}
          icon={ArrowDownCircle}
        />
        <StatCard label="Net this month" value={net.toLocaleString()} icon={Scale} />
        <StatCard
          label="Subscriptions / mo"
          value={Math.round(monthlySubTotal).toLocaleString()}
          icon={Wallet}
        />
      </div>

      <Card title="Transactions">
        <TransactionList transactions={transactions} setTransactions={setTransactions} />
      </Card>

      <Card title="Subscriptions">
        <SubscriptionList subscriptions={subscriptions} setSubscriptions={setSubscriptions} />
      </Card>
    </div>
  );
}

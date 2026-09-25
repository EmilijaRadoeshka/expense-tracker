import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, Rectangle, ResponsiveContainer } from 'recharts';

// Fixed categorical order: a category keeps its color no matter which others are present.
const PALETTE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"];
const TEXT_SECONDARY = "#52514e";
const CHART_HEIGHT = 260;

function SpendingTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { category, total, percent } = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-label">{category}</span>
      <span className="chart-tooltip-value">${total} ({percent}%)</span>
    </div>
  );
}

function CategoryBar(props) {
  return <Rectangle {...props} fill={props.payload.fill} radius={[4, 4, 0, 0]} />;
}

function SpendingChart({ transactions, categories }) {
  const totals = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

  const grandTotal = Object.values(totals).reduce((sum, v) => sum + v, 0);

  const data = Object.entries(totals)
    .map(([category, total]) => ({
      category,
      total,
      percent: Math.round((total / grandTotal) * 100),
      fill: PALETTE[categories.indexOf(category) % PALETTE.length],
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="spending-chart">
      <h2>Spending by Category</h2>
      {data.length === 0 ? (
        <p className="chart-empty">No expenses yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={data} margin={{ top: 24, right: 8, bottom: 8, left: 8 }}>
            <XAxis
              dataKey="category"
              axisLine={{ stroke: "#ddd" }}
              tickLine={false}
              interval={0}
              tick={{ fill: TEXT_SECONDARY, fontSize: 13 }}
            />
            <YAxis hide />
            <Tooltip content={<SpendingTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.04)" }} />
            <Bar dataKey="total" maxBarSize={48} shape={CategoryBar}>
              <LabelList
                dataKey="total"
                position="top"
                formatter={value => `$${value}`}
                style={{ fill: TEXT_SECONDARY, fontSize: 13 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SpendingChart

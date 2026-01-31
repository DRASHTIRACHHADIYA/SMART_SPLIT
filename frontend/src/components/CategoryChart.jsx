import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

/**
 * CategoryChart - Shows expense breakdown by category
 */
function CategoryChart({ expenses = [] }) {
    // Category colors and labels
    const categoryConfig = {
        food: { label: 'Food & Dining', color: '#ef4444' },
        transport: { label: 'Transport', color: '#f59e0b' },
        entertainment: { label: 'Entertainment', color: '#8b5cf6' },
        utilities: { label: 'Utilities', color: '#3b82f6' },
        rent: { label: 'Rent', color: '#10b981' },
        shopping: { label: 'Shopping', color: '#ec4899' },
        health: { label: 'Health', color: '#06b6d4' },
        other: { label: 'Other', color: '#6b7280' }
    };

    // Aggregate expenses by category
    const aggregateByCategory = () => {
        const categoryMap = {};

        expenses.forEach(expense => {
            const category = expense.category || 'other';
            if (!categoryMap[category]) {
                categoryMap[category] = {
                    name: categoryConfig[category]?.label || 'Other',
                    value: 0,
                    color: categoryConfig[category]?.color || '#6b7280',
                    count: 0
                };
            }
            categoryMap[category].value += expense.amount;
            categoryMap[category].count += 1;
        });

        return Object.values(categoryMap).filter(cat => cat.value > 0);
    };

    const data = aggregateByCategory();

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const total = data.reduce((sum, item) => sum + item.value, 0);
            const percentage = ((payload[0].value / total) * 100).toFixed(1);

            return (
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {payload[0].name}
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: payload[0].payload.color }}>
                        ₹{payload[0].value.toFixed(2)}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {percentage}% • {payload[0].payload.count} expense{payload[0].payload.count !== 1 ? 's' : ''}
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't show label for very small slices

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                style={{ fontSize: '12px', fontWeight: 600 }}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (expenses.length === 0) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)'
            }}>
                No category data available
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) => (
                            <span style={{ color: 'var(--text-primary)', fontSize: '12px' }}>
                                {value}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export default CategoryChart;
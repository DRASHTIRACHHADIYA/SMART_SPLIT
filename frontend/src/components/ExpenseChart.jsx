import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

/**
 * ExpenseChart - Shows expense trends over time
 * Supports both line and bar chart modes
 */
function ExpenseChart({ expenses = [], mode = 'line', days = 30 }) {
    // Aggregate expenses by date
    const aggregateByDate = () => {
        const dateMap = {};
        const endDate = new Date();
        const startDate = subDays(endDate, days - 1);

        // Initialize all dates with 0
        for (let i = 0; i < days; i++) {
            const date = subDays(endDate, days - 1 - i);
            const dateKey = format(startOfDay(date), 'MMM dd');
            dateMap[dateKey] = { date: dateKey, amount: 0, count: 0 };
        }

        // Aggregate actual expenses
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.createdAt);
            if (expenseDate >= startDate && expenseDate <= endDate) {
                const dateKey = format(startOfDay(expenseDate), 'MMM dd');
                if (dateMap[dateKey]) {
                    dateMap[dateKey].amount += expense.amount;
                    dateMap[dateKey].count += 1;
                }
            }
        });

        return Object.values(dateMap);
    };

    const data = aggregateByDate();

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {payload[0].payload.date}
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--primary)' }}>
                        ₹{payload[0].value.toFixed(2)}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {payload[0].payload.count} expense{payload[0].payload.count !== 1 ? 's' : ''}
                    </p>
                </div>
            );
        }
        return null;
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
                No expense data available
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                {mode === 'line' ? (
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-muted)"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="var(--text-muted)"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="var(--primary)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--primary)', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                ) : (
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-muted)"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="var(--text-muted)"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="amount" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}

export default ExpenseChart;

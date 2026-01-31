import { formatDistanceToNow } from 'date-fns';

/**
 * ActivityFeed - Shows chronological activity timeline for a group
 */
function ActivityFeed({ groupId, activities = [] }) {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'expense':
                return '💸';
            case 'member':
                return '👤';
            case 'settlement':
                return '🤝';
            default:
                return '📌';
        }
    };

    const getActivityClass = (type) => {
        switch (type) {
            case 'expense':
                return 'expense';
            case 'member':
                return 'member';
            case 'settlement':
                return 'settlement';
            default:
                return 'expense';
        }
    };

    if (!activities || activities.length === 0) {
        return (
            <div className="empty-state-small">
                <p>No activity yet</p>
            </div>
        );
    }

    return (
        <div className="activity-feed">
            {activities.map((activity, index) => (
                <div key={index} className="activity-item">
                    <div className={`activity-icon ${getActivityClass(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                        <div
                            className="activity-text"
                            dangerouslySetInnerHTML={{ __html: activity.text }}
                        />
                        <div className="activity-time">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </div>
                    </div>
                    {activity.amount && (
                        <div className="activity-amount">
                            ₹{activity.amount.toFixed(2)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ActivityFeed;

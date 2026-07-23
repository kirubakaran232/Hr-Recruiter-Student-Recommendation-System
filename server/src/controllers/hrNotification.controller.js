import { Notification } from '../models/Notification.js';

// ── GET /api/hr/notifications ──────────────────────────────────────────────────
export async function getNotifications(req, res, next) {
  try {
    const hrUserId = req.user._id;

    // Seed default notifications if none exist yet for demonstration
    const count = await Notification.countDocuments({ hrUserId });
    if (count === 0) {
      await Notification.insertMany([
        {
          hrUserId,
          title: 'New Candidate Batch Uploaded',
          message: '15 new candidates imported from "backend_candidates.xlsx"',
          type: 'import',
          isRead: false
        },
        {
          hrUserId,
          title: 'AI Evaluation Completed',
          message: 'AI profile intelligence evaluation complete for 12 candidates.',
          type: 'evaluation',
          isRead: false
        },
        {
          hrUserId,
          title: 'Automated Shortlist Generated',
          message: '4 candidates met your score thresholds (>85) and were shortlisted.',
          type: 'shortlist',
          isRead: false
        },
        {
          hrUserId,
          title: 'Interview Reminder',
          message: 'Upcoming interview with Jane Smith scheduled for tomorrow at 10:00 AM.',
          type: 'reminder',
          isRead: true
        }
      ]);
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ hrUserId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Notification.countDocuments({ hrUserId, isRead: false })
    ]);

    res.status(200).json({
      success: true,
      unreadCount,
      notifications: notifications.map((n) => ({
        id:        n._id.toString(),
        title:     n.title,
        message:   n.message,
        type:      n.type,
        isRead:    n.isRead,
        link:      n.link,
        createdAt: n.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

// ── PATCH /api/hr/notifications/:id/read ──────────────────────────────────────
export async function markNotificationAsRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, hrUserId: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      const err = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
}

// ── PATCH /api/hr/notifications/read-all ──────────────────────────────────────
export async function markAllNotificationsAsRead(req, res, next) {
  try {
    await Notification.updateMany(
      { hrUserId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
}

// ── DELETE /api/hr/notifications ──────────────────────────────────────────────
export async function clearAllNotifications(req, res, next) {
  try {
    await Notification.deleteMany({ hrUserId: req.user._id });
    res.status(200).json({
      success: true,
      message: 'Notifications cleared'
    });
  } catch (error) {
    next(error);
  }
}

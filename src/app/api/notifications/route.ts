import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

export const dynamic = "force-dynamic";

// GET /api/notifications - Fetch all notifications
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "50");
        const unreadOnly = searchParams.get("unread") === "true";

        const query: Record<string, any> = {};
        if (unreadOnly) {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const unreadCount = await Notification.countDocuments({ read: false });

        return NextResponse.json({
            notifications,
            unreadCount,
            total: notifications.length,
        });
    } catch (error: any) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { ids, markAllRead } = body;

        if (markAllRead) {
            // Mark all notifications as read
            await Notification.updateMany({ read: false }, { read: true });
            return NextResponse.json({ success: true, markedAll: true });
        }

        if (ids && Array.isArray(ids) && ids.length > 0) {
            // Mark specific notifications as read
            await Notification.updateMany(
                { _id: { $in: ids } },
                { read: true }
            );
            return NextResponse.json({ success: true, markedIds: ids });
        }

        return NextResponse.json(
            { error: "Provide 'ids' array or 'markAllRead: true'" },
            { status: 400 }
        );
    } catch (error: any) {
        console.error("Error updating notifications:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update notifications" },
            { status: 500 }
        );
    }
}

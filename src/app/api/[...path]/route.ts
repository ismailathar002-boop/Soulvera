import { NextRequest, NextResponse } from "next/server";
import {
  DUMMY_USERS, DUMMY_PROPOSALS, DUMMY_MESSAGES, DUMMY_NOTIFICATIONS,
  getUserFromToken, ALL_USERS_ARRAY, MALE_PROFILES, FEMALE_PROFILES,
} from "@/lib/dummyData";

const ok = (data: object) => NextResponse.json({ success: true, ...data });
const fail = (msg: string, status = 400) => NextResponse.json({ success: false, message: msg }, { status });

function getToken(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  return auth.replace("Bearer ", "").trim() || null;
}

function buildProfileList(users: any[]) {
  return users.map((u) => ({
    ...u.profile,
    user_id: u.id,
    user: { id: u.id, soulvera_id: u.soulvera_id, name: u.name, email: u.email, role: u.role, is_verified: u.is_verified },
  }));
}

function buildUserResponse(u: any) {
  return {
    id: u.id, soulvera_id: u.soulvera_id, name: u.name, email: u.email,
    phone: u.phone, role: u.role, is_verified: u.is_verified,
    created_at: u.created_at,
    profileData: u.profile || null,
    profileCreated: !!u.profile?.profile_complete,
    isShortlisted: false,
  };
}

async function handle(method: string, path: string[], req: NextRequest): Promise<NextResponse> {
  const token = getToken(req);
  const currentUser = getUserFromToken(token);
  const [seg0, seg1, seg2, seg3] = path;

  // ── AUTH ─────────────────────────────────────────────────────────────────
  if (seg0 === "auth") {
    if (seg1 === "me") {
      if (!currentUser) return fail("Unauthorized", 401);
      return ok({ user: buildUserResponse(currentUser) });
    }
    if (seg1 === "login" && method === "POST") {
      const body = await req.json().catch(() => ({}));
      const email: string = (body.email || "").toLowerCase();
      const isAdmin = email.includes("admin");
      const uid = isAdmin ? "admin-001" : "user-006";
      const u = DUMMY_USERS[uid];
      const demoToken = isAdmin ? "demo_admin_token" : "demo_user_token";
      return ok({ token: demoToken, user: buildUserResponse(u) });
    }
    if (seg1 === "register" && method === "POST") {
      const u = DUMMY_USERS["user-006"];
      return ok({ token: "demo_user_token", user: buildUserResponse(u) });
    }
  }

  // ── PROFILES ─────────────────────────────────────────────────────────────
  if (seg0 === "profiles") {
    // GET /profiles/shortlist
    if (seg1 === "shortlist" && !seg2 && method === "GET") {
      return ok({ shortlist: [{ target_user_id: "user-001" }] });
    }
    // PUT /profiles/wizard
    if (seg1 === "wizard" && method === "PUT") {
      return ok({ message: "Profile saved!", profile: DUMMY_USERS["user-006"].profile });
    }
    // GET /profiles — search
    if (!seg1 && method === "GET") {
      const profiles = currentUser?.role === "individual"
        ? buildProfileList(MALE_PROFILES)
        : buildProfileList([...MALE_PROFILES, ...FEMALE_PROFILES]);
      return ok({ profiles, count: profiles.length, total: profiles.length, page: 1, pages: 1, genderFilter: "Male" });
    }
    // POST /profiles/:userId/shortlist
    if (seg2 === "shortlist" && method === "POST") {
      return ok({ message: "Shortlist updated.", isShortlisted: true });
    }
    // GET /profiles/:userId
    if (seg1 && !seg2 && method === "GET") {
      const u = DUMMY_USERS[seg1];
      if (!u) return fail("Profile not found.", 404);
      return ok({ user: buildUserResponse(u) });
    }
  }

  // ── PROPOSALS ─────────────────────────────────────────────────────────────
  if (seg0 === "proposals") {
    // GET /proposals/admin/payments
    if (seg1 === "admin" && seg2 === "payments" && method === "GET") {
      return ok({ proposals: [] });
    }
    // GET /proposals
    if (!seg1 && method === "GET") {
      const uid = currentUser?.id || "user-006";
      const sent = DUMMY_PROPOSALS.filter((p) => p.sender_id === uid).map((p) => ({
        ...p,
        receiver: { id: p.receiver.id, soulvera_id: p.receiver.soulvera_id, name: p.receiver.name, profile: p.receiver.profile },
      }));
      const received = DUMMY_PROPOSALS.filter((p) => p.receiver_id === uid).map((p) => ({
        ...p,
        sender: { id: p.sender.id, soulvera_id: p.sender.soulvera_id, name: p.sender.name, profile: p.sender.profile },
      }));
      return ok({ sent, received });
    }
    // POST /proposals/:id (send proposal)
    if (seg1 && !seg2 && method === "POST") {
      return ok({ message: "Proposal sent!", proposal: { id: "prop-new-" + Date.now(), status: "pending", admin_status: "pending" } });
    }
    // PUT /proposals/:id/respond
    if (seg2 === "respond" && method === "PUT") {
      return ok({ message: "Response recorded." });
    }
    // PUT /proposals/:id/approve-chat
    if (seg2 === "approve-chat" && method === "PUT") {
      return ok({ message: "Chat approved!" });
    }
  }

  // ── MESSAGES ──────────────────────────────────────────────────────────────
  if (seg0 === "messages") {
    const partnerId = seg1 || "user-001";
    if (method === "GET") {
      const msgs = DUMMY_MESSAGES[partnerId] || [];
      return ok({ messages: msgs });
    }
    if (method === "POST") {
      const body = await req.json().catch(() => ({}));
      const newMsg = {
        id: "msg-new-" + Date.now(),
        sender_id: currentUser?.id || "user-006",
        receiver_id: partnerId,
        content: body.content || "",
        created_at: new Date().toISOString(),
      };
      return ok({ message: newMsg });
    }
  }

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  if (seg0 === "notifications") {
    if (!seg1 && method === "GET") {
      const unread = DUMMY_NOTIFICATIONS.filter((n) => !n.read).length;
      return ok({ notifications: DUMMY_NOTIFICATIONS, unreadCount: unread });
    }
    if (seg2 === "read" && method === "PUT") {
      return ok({ message: "Marked as read." });
    }
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  if (seg0 === "admin") {
    // GET /admin/users
    if (seg1 === "users" && !seg2 && method === "GET") {
      const users = ALL_USERS_ARRAY.map((u) => ({ ...u, profile: u.profile }));
      return ok({ users });
    }
    // PUT /admin/users/:userId/verify
    if (seg1 === "users" && seg3 === "verify" && method === "PUT") {
      return ok({ message: "Verification updated." });
    }
    // PUT /admin/users/:userId/status
    if (seg1 === "users" && seg3 === "status" && method === "PUT") {
      return ok({ message: "Status updated." });
    }
    // GET /admin/proposals/all
    if (seg1 === "proposals" && seg2 === "all" && method === "GET") {
      return ok({ proposals: DUMMY_PROPOSALS });
    }
    // PUT /admin/proposals/:id/review
    if (seg1 === "proposals" && seg3 === "review" && method === "PUT") {
      return ok({ message: "Proposal reviewed." });
    }
    // GET /admin/stats
    if (seg1 === "stats" && method === "GET") {
      return ok({
        stats: {
          users: { total: ALL_USERS_ARRAY.length, verified: ALL_USERS_ARRAY.filter((u) => u.is_verified).length, individual: 8, family: 2, matchmaker: 0 },
          proposals: { total: DUMMY_PROPOSALS.length, accepted: 1, pendingAdmin: 4 },
          messagesCount: 5,
        },
      });
    }
  }

  return ok({});
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handle("GET", path, req);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handle("POST", path, req);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handle("PUT", path, req);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handle("DELETE", path, req);
}

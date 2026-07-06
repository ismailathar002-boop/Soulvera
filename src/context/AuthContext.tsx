"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "individual" | "family" | "matchmaker" | "admin";

export interface ProfileData {
  age: number;
  gender: string;
  maritalStatus: string;
  height: string;
  build?: string;
  religion: string;
  sect: string;
  religiousPractice?: string;
  caste: string;
  subCaste: string;
  language: string;
  city: string;
  relocate?: string;
  // Education & Career
  education: string;
  grade?: string;
  educationHonors?: string;
  islamicEducation?: string;
  profession: string;
  income: string;
  // Family
  fatherOccupation?: string;
  motherOccupation?: string;
  brothersCount?: number;
  brothersMarried?: number;
  sistersCount?: number;
  sistersEducated?: boolean;
  familyDescription?: string;
  // Residence & Assets
  housesCount?: number;
  houseLocation?: string;
  agriculturalLand?: boolean;
  plots?: string;
  residenceAddress?: string;
  // Partner Preferences
  partnerMinAge?: number;
  partnerMaxAge?: number;
  partnerHeight?: string;
  partnerEducation?: string;
  partnerProfession?: string;
  partnerCaste?: string;
  partnerCity?: string;
  partnerMaritalStatus?: string;
  // Photo & Privacy
  photoUrl?: string;
  galleryUrls?: string[];
  photoPrivacy: "public" | "request" | "private";
  aboutMe?: string;
  contactNumber?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole | "admin";
  profileCreated: boolean;
  profileData?: ProfileData;
  shortlist: string[]; // Array of user IDs
  favorites: string[];
  proposals: {
    id: string;
    targetUserId: string; // ID of the person proposed to
    senderName: string;
    senderId: string;
    status: "pending" | "accepted" | "rejected";
    timestamp: string;
  }[];
}

interface AuthContextType {
  user: User | null;
  allProfiles: User[];
  register: (
    name: string,
    email: string,
    phone: string,
    role: UserRole,
    password?: string,
    about?: string,
    profilePhoto?: string
  ) => Promise<User>;
  login: (email: string, password?: string) => Promise<User>;
  logout: () => void;
  updateProfile: (profileData: ProfileData) => Promise<User>;
  sendProposal: (targetUserId: string) => Promise<void>;
  respondProposal: (proposalId: string, status: "accepted" | "rejected") => Promise<void>;
  toggleShortlist: (userId: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = "/api";

// Helper helper: Normalize backend response structure to frontend types
const mapBackendUserToFrontend = (
  backendUser: any,
  shortlistsData: any[] = [],
  proposalsData: { sent: any[]; received: any[] } = { sent: [], received: [] }
): User => {
  const profile = backendUser.profileData || backendUser.profile || {};
  
  // Format proposals
  const sentProposals = (proposalsData.sent || []).map((p: any) => ({
    id: p.id,
    targetUserId: p.receiver_id || p.receiverId,
    senderName: backendUser.name,
    senderId: backendUser.id,
    status: p.status,
    timestamp: p.created_at || p.updated_at || new Date().toISOString(),
  }));

  const receivedProposals = (proposalsData.received || []).map((p: any) => ({
    id: p.id,
    targetUserId: backendUser.id,
    senderName: p.sender?.name || "",
    senderId: p.sender_id || p.senderId,
    status: p.status,
    timestamp: p.created_at || p.updated_at || new Date().toISOString(),
  }));

  // Format shortlist
  const shortlistIds = shortlistsData.map((s: any) => s.target_user_id || s.targetUserId);

  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    phone: backendUser.phone || "",
    role: backendUser.role,
    profileCreated: backendUser.profileCreated || profile?.profile_complete || false,
    shortlist: shortlistIds,
    favorites: [],
    proposals: [...sentProposals, ...receivedProposals],
    profileData: profile && (profile.age || profile.gender || profile.about_me) ? {
      age: profile.age || 0,
      gender: profile.gender || "",
      maritalStatus: profile.marital_status || profile.maritalStatus || "",
      height: profile.height || "",
      religion: profile.religion || "",
      caste: profile.caste || "",
      subCaste: profile.sub_caste || profile.subCaste || "",
      sect: profile.sect || "",
      language: profile.language || "",
      city: profile.city || "",
      education: profile.education || "",
      profession: profile.profession || "",
      income: profile.income || "",
      photoUrl: profile.photo_url || profile.photoUrl || "",
      galleryUrls: profile.gallery_urls || profile.galleryUrls || [],
      photoPrivacy: profile.photo_privacy || profile.photoPrivacy || "public",
      aboutMe: profile.about_me || profile.aboutMe || "",
    } : undefined,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allProfiles, setAllProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize DB from REST API and LocalStorage token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("soulvera_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch logged-in user profile
        const resUser = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resUser.ok) {
          throw new Error("Token expired or invalid");
        }

        const dataUser = await resUser.json();
        
        // Fetch active user's shortlists
        const resShort = await fetch(`${API_BASE}/profiles/shortlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataShort = resShort.ok ? await resShort.json() : { shortlist: [] };

        // Fetch proposals
        const resProp = await fetch(`${API_BASE}/proposals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataProp = resProp.ok ? await resProp.json() : { sent: [], received: [] };

        // Normalize
        const frontendUser = mapBackendUserToFrontend(
          dataUser.user,
          dataShort.shortlist,
          dataProp
        );
        setUser(frontendUser);

        // Fetch all other profiles
        await fetchProfiles(token, frontendUser);
      } catch (err) {
        console.error("Session restore failed:", err);
        localStorage.removeItem("soulvera_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const fetchProfiles = async (token: string, currentUser: User) => {
    try {
      const res = await fetch(`${API_BASE}/profiles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mappedProfiles = (data.profiles || []).map((p: any) => {
          // Normalize proposals for other profiles too
          const relatedProposals = currentUser.proposals.filter(
            (prop) => prop.targetUserId === p.user_id || prop.senderId === p.user_id
          ).map(pProp => ({
            id: pProp.id,
            targetUserId: pProp.targetUserId,
            senderName: pProp.senderName,
            senderId: pProp.senderId,
            status: pProp.status,
            timestamp: pProp.timestamp,
          }));

          return {
            id: p.user?.id || p.user_id,
            name: p.user?.name || "",
            email: p.user?.email || "",
            phone: p.user?.phone || "",
            role: p.user?.role || "individual",
            profileCreated: p.profile_complete || false,
            shortlist: [],
            favorites: [],
            proposals: relatedProposals,
            profileData: {
              age: p.age || 0,
              gender: p.gender || "",
              maritalStatus: p.marital_status || "",
              height: p.height || "",
              religion: p.religion || "",
              caste: p.caste || "",
              subCaste: p.sub_caste || "",
              sect: p.sect || "",
              language: p.language || "",
              city: p.city || "",
              education: p.education || "",
              profession: p.profession || "",
              income: p.income || "",
              photoUrl: p.photo_url || "",
              galleryUrls: p.gallery_urls || [],
              photoPrivacy: p.photo_privacy || "public",
              aboutMe: p.about_me || "",
            },
          };
        });
        setAllProfiles(mappedProfiles);
      }
    } catch (err) {
      console.error("Failed to load profiles:", err);
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    role: UserRole,
    password?: string,
    about?: string,
    profilePhoto?: string
  ): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        role,
        password: password || "password123", // default fallback for safety
        aboutMe: about,
        profilePhoto,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    localStorage.setItem("soulvera_token", data.token);
    const frontendUser = mapBackendUserToFrontend(data.user);
    setUser(frontendUser);

    await fetchProfiles(data.token, frontendUser);
    return frontendUser;
  };

  const login = async (email: string, password?: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: password || "password123",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("soulvera_token", data.token);

    // Fetch shortlist
    const resShort = await fetch(`${API_BASE}/profiles/shortlist`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    const dataShort = resShort.ok ? await resShort.json() : { shortlist: [] };

    // Fetch proposals
    const resProp = await fetch(`${API_BASE}/proposals`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    const dataProp = resProp.ok ? await resProp.json() : { sent: [], received: [] };

    const frontendUser = mapBackendUserToFrontend(
      data.user,
      dataShort.shortlist,
      dataProp
    );
    setUser(frontendUser);

    await fetchProfiles(data.token, frontendUser);
    return frontendUser;
  };

  const logout = () => {
    localStorage.removeItem("soulvera_token");
    setUser(null);
    setAllProfiles([]);
  };

  const updateProfile = async (profileData: ProfileData): Promise<User> => {
    const token = localStorage.getItem("soulvera_token");
    if (!token) throw new Error("No session active");

    const res = await fetch(`${API_BASE}/profiles/wizard`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update profile");
    }

    // Reload active user details
    const resUser = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dataUser = await resUser.json();

    const resShort = await fetch(`${API_BASE}/profiles/shortlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dataShort = resShort.ok ? await resShort.json() : { shortlist: [] };

    const resProp = await fetch(`${API_BASE}/proposals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dataProp = resProp.ok ? await resProp.json() : { sent: [], received: [] };

    const frontendUser = mapBackendUserToFrontend(
      dataUser.user,
      dataShort.shortlist,
      dataProp
    );
    setUser(frontendUser);

    await fetchProfiles(token, frontendUser);
    return frontendUser;
  };

  const sendProposal = async (targetUserId: string) => {
    const token = localStorage.getItem("soulvera_token");
    if (!token) return;

    const res = await fetch(`${API_BASE}/proposals/${targetUserId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: "Proceeding with proposal connecting hearts." }),
    });

    if (res.ok) {
      // Reload proposals
      const resProp = await fetch(`${API_BASE}/proposals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataProp = resProp.ok ? await resProp.json() : { sent: [], received: [] };

      // Reload shortlist
      const resShort = await fetch(`${API_BASE}/profiles/shortlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataShort = resShort.ok ? await resShort.json() : { shortlist: [] };

      if (user) {
        const updated = mapBackendUserToFrontend(user, dataShort.shortlist, dataProp);
        setUser(updated);
        await fetchProfiles(token, updated);
      }
    }
  };

  const respondProposal = async (proposalId: string, status: "accepted" | "rejected") => {
    const token = localStorage.getItem("soulvera_token");
    if (!token) return;

    const res = await fetch(`${API_BASE}/proposals/${proposalId}/respond`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      // Reload proposals
      const resProp = await fetch(`${API_BASE}/proposals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataProp = resProp.ok ? await resProp.json() : { sent: [], received: [] };

      const resShort = await fetch(`${API_BASE}/profiles/shortlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataShort = resShort.ok ? await resShort.json() : { shortlist: [] };

      if (user) {
        const updated = mapBackendUserToFrontend(user, dataShort.shortlist, dataProp);
        setUser(updated);
        await fetchProfiles(token, updated);
      }
    }
  };

  const toggleShortlist = async (userId: string) => {
    const token = localStorage.getItem("soulvera_token");
    if (!token) return;

    const res = await fetch(`${API_BASE}/profiles/${userId}/shortlist`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      // Reload shortlist
      const resShort = await fetch(`${API_BASE}/profiles/shortlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataShort = resShort.ok ? await resShort.json() : { shortlist: [] };

      // Reload proposals
      const resProp = await fetch(`${API_BASE}/proposals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataProp = resProp.ok ? await resProp.json() : { sent: [], received: [] };

      if (user) {
        const updated = mapBackendUserToFrontend(user, dataShort.shortlist, dataProp);
        setUser(updated);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        allProfiles,
        register,
        login,
        logout,
        updateProfile,
        sendProposal,
        respondProposal,
        toggleShortlist,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


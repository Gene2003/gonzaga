import React from "react";
import { useAuth } from "../../hooks/useAuth";

const ProfileOverview = () => {
  const { user } = useAuth();
  console.log("👤 ProfileOverview user:", user);


  if (!user) {
    return (
      <div className="bg-white p-6 rounded-xl shadow border mb-6">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/?ref=${user.username}`;

  return (
    <div className="bg-white p-6 rounded-xl shadow border mb-6">
      <h2 className="text-xl font-semibold mb-4">Affiliate Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Username</p>
          <p className="font-medium">{user.username}</p>
        </div>
        <div>
          <p className="text-gray-500">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-gray-500">Role</p>
          <p className="font-medium capitalize">{user.role || "affiliate"}</p>
        </div>
        <div>
          <p className="text-gray-500">Referral Link</p>
          <p className="font-medium text-blue-600 break-all">{referralLink}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;

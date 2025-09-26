// File: src/pages/user/Profile.jsx
import React, { useEffect, useState } from "react";
import { getCurrentUser, updateUserProfile } from "../../services/userService";
import ProfileCard from "../../components/user/ProfileCard";
import Layout, { Section, Card } from "../../components/Layout/Layout";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (updates) => {
    try {
      const updatedUser = await updateUserProfile(user.id, updates);
      setUser((prev) => ({ ...prev, ...updatedUser }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <Layout>
      <Section spacing="relaxed" background="subtle">
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl">
            <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
            <ProfileCard user={user} onUpdate={handleUpdate} />
          </Card>
        </div>
      </Section>
    </Layout>
  );
};

export default Profile;

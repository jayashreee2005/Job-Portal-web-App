import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { authUtils } from "../utils/auth";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const currentUser = await authUtils.getUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }

        if (isMounted) {
          setProfile(currentUser);
        }
      } catch (error) {
        if (isMounted) {
          router.push("/login");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="page-shell">
      <Navbar />

      <main className="main-content container">
        {isLoading ? (
          <div className="card">
            <p>Loading profile...</p>
          </div>
        ) : !profile ? (
          <div className="card">
            <p>Profile not found.</p>
          </div>
        ) : (
          <section className="profile-section">
            <div className="card profile-hero-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {profile.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="profile-hero-copy">
                  <p className="eyebrow">Account Profile</p>
                  <h1 style={{ margin: "0 0 8px 0" }}>{profile.name}</h1>
                  <p style={{ margin: 0, color: "var(--muted)" }}>
                    Role: <strong>{profile.role}</strong> • Registered: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-heading profile-section-heading">
                <h2>Account Details</h2>
                <p>Your authenticated details from the backend server.</p>
              </div>

              <div className="profile-view-grid">
                <div className="profile-view-item">
                  <span>User ID</span>
                  <strong>{profile.id}</strong>
                </div>
                <div className="profile-view-item">
                  <span>Full Name</span>
                  <strong>{profile.name}</strong>
                </div>
                <div className="profile-view-item">
                  <span>Email Address</span>
                  <strong>{profile.email}</strong>
                </div>
                <div className="profile-view-item">
                  <span>Phone Number</span>
                  <strong>{profile.phone || "Not provided"}</strong>
                </div>
                <div className="profile-view-item">
                  <span>Role</span>
                  <strong>{profile.role}</strong>
                </div>
                <div className="profile-view-item">
                  <span>Account Created</span>
                  <strong>{profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "N/A"}</strong>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
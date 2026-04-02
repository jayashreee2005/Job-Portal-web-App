import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { authUtils } from "../utils/auth";

export default function Profile() {
  const router = useRouter();
  const [name, setName] = useState(() => {
    if (typeof window === "undefined") {
      return "Student User";
    }

    const authUser = authUtils.getUser();
    const rawProfile = localStorage.getItem("profileData");
    const profile = rawProfile ? JSON.parse(rawProfile) : null;
    return profile?.name || authUser?.name || "Student User";
  });
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "student@example.com";
    }

    const authUser = authUtils.getUser();
    const rawProfile = localStorage.getItem("profileData");
    const profile = rawProfile ? JSON.parse(rawProfile) : null;
    return profile?.email || authUser?.email || "student@example.com";
  });
  const [phone, setPhone] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const rawProfile = localStorage.getItem("profileData");
    const profile = rawProfile ? JSON.parse(rawProfile) : null;
    return profile?.phone || "";
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!authUtils.isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const handleSave = () => {
    const profileData = { name, email, phone };
    localStorage.setItem("profileData", JSON.stringify(profileData));
    alert("Profile saved in browser.");
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="main-content container">
        <section className="profile-section">
          <div className="card">
            <div className="profile-header">
              <div className="profile-avatar">
                {name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 style={{ margin: "0 0 8px 0" }}>My Profile</h1>
                <p style={{ margin: "0", color: "var(--muted)" }}>
                  Update your profile information below
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experience</label>
                <input
                  id="experience"
                  type="text"
                  placeholder="Years of experience or role"
                />
              </div>

              <div className="form-group">
                <label htmlFor="skills">Skills</label>
                <textarea
                  id="skills"
                  placeholder="List your skills separated by commas"
                  rows="3"
                  style={{ fontFamily: "inherit", resize: "none" }}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  rows="3"
                  style={{ fontFamily: "inherit", resize: "none" }}
                ></textarea>
              </div>
            </div>

            <button
              className="button"
              type="button"
              onClick={handleSave}
              style={{ marginTop: "20px" }}
            >
              Save Changes
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
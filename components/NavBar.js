import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authUtils } from "../utils/auth";

export default function Navbar() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setIsAuth(authUtils.isAuthenticated());
    setUser(authUtils.getUser());
  }, []);

  const handleLogout = () => {
    authUtils.logout();
    setIsAuth(false);
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand">
          Job Portal
        </Link>
        <nav className="nav-links">
          {isAuth ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/saved">Saved</Link>
              <Link href="/profile">Profile</Link>
              <span className="nav-user">
                Welcome, {user?.name}!
              </span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/saved">Saved</Link>
              <Link href="/profile">Profile</Link>
              <Link href="/login">Login</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

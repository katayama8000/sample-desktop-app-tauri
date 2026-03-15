import { NavLink } from "react-router-dom";

export function RouteNav() {
  return (
    <nav className="route-nav" aria-label="ページ切り替え">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? "route-link active" : "route-link"}
      >
        Home
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          isActive ? "route-link active" : "route-link"}
      >
        Settings
      </NavLink>
    </nav>
  );
}

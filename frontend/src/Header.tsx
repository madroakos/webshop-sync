import React from "react";

export function Header() {
  return (
    <header>
      <div>
        <h1>Webshop dashboard</h1>
      </div>
      <div>
        <nav>
          <ul className="flex navbarList">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/categories">Categories</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

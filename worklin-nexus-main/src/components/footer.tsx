import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-5 md:px-6">
        <div className="md:col-span-2">
          <div className="text-xl font-bold text-primary">Worklin</div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Work. Linked. A freelance marketplace built for serious, professional work.
          </p>
        </div>
        <FooterCol title="Platform" links={[
          { to: "/jobs", label: "Browse Jobs" },
          { to: "/categories", label: "Categories" },
          { to: "/how-it-works", label: "How It Works" },
        ]} />
        <FooterCol title="Company" links={[
          { to: "/about", label: "About" },
          { to: "/about", label: "Careers" },
          { to: "/about", label: "Press" },
        ]} />
        <FooterCol title="Account" links={[
          { to: "/login", label: "Login" },
          { to: "/signup", label: "Sign Up" },
          { to: "/dashboard", label: "Dashboard" },
        ]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground md:px-6">
          © {new Date().getFullYear()} Worklin. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <div className="mb-3 text-sm font-semibold text-foreground">{title}</div>
      <ul className="space-y-2">
        {links.map((l, i) => (
          <li key={i}>
            <Link to={l.to as never} className="text-sm text-muted-foreground hover:text-primary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

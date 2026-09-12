import Link from "next/link";

export interface LocalNavLink { label: string; href: string; current?: boolean }

export default function LocalNav({
  title,
  href,
  links,
  cta,
}: {
  title: string;
  href: string;
  links: LocalNavLink[];
  cta?: { label: string; href: string };
}) {
  return (
    <div className="localnav">
      <div className="localnav-inner">
        <p className="localnav-title">
          <Link href={href}>{title}</Link>
        </p>
        <nav className="localnav-links" aria-label={`${title} sections`}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={l.current ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        {cta && (
          <Link href={cta.href} className="btn btn-sm">
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}

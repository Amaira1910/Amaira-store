import Link from "next/link";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

export interface Crumb { name: string; href: string }

export default function Crumbs({ trail }: { trail: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="crumbs">
          {trail.map((c, i) => (
            <li key={c.href}>
              {i === trail.length - 1 ? (
                <span aria-current="page">{c.name}</span>
              ) : (
                <Link href={c.href}>{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd(trail))} />
    </>
  );
}

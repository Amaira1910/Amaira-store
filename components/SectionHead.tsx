import Link from "next/link";
import { IconChevronRight } from "@/components/Icons";

interface Props {
  title: string;
  sub?: string;
  href?: string;
  linkText?: string;
  align?: "left" | "center";
}

export default function SectionHead({ title, sub, href, linkText = "See all", align = "left" }: Props) {
  return (
    <div className={`rail-head${align === "center" ? " center" : ""}`} style={align === "center" ? { display: "block" } : undefined}>
      <div>
        <h2 className="t-title balance">{title}</h2>
        {sub && <p className="t-body-lg muted pretty" style={{ marginTop: 10, maxWidth: "58ch" }}>{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="link-cta">
          {linkText}
          <IconChevronRight size={16} className="chev" />
        </Link>
      )}
    </div>
  );
}

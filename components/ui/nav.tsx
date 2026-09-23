import Link from "next/link";
import Image from "next/image";

export function Nav() {
  return (
    <header className="navbar">
      <Link href="/" className="logo" aria-label="Explore Manipur - Home">
        <span className="logo-mark">
          <Image src="/images/logo.jpeg" alt="Explore Manipur" width={34} height={34} />
        </span>
        <span>Explore Manipur</span>
      </Link>
      <nav className="nav-links">
        <Link href="/#experiences">Experiences</Link>
        <Link href="/#destinations">Destinations</Link>
        <Link href="/travel-stay">Travel & Stay</Link>
        <Link href="/#map">Map</Link>
      </nav>
      <Link href="/" className="nav-button">
        Explore Manipur →
      </Link>
    </header>
  );
}

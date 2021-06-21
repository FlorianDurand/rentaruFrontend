import Button from "../elements/Button";
import Link from "next/link";

export default function error() {
  return (
    <div className="div404">
      <h1>404</h1>
      <div className="sushi">Ooops, Il y a un sushi.</div>
      <div className="notFound">page not found</div>
      <img src="/sushi.svg" alt="sushi404" />
      <Link href="/">
        <a>
          <Button color="Red">Go Home</Button>
        </a>
      </Link>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function Home({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams?.q?.trim() || "";
  const listings = await prisma.listing.findMany({
    where: q ? { OR: [
      { title: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } }
    ] } : undefined,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search Gemora" className="input" />
        <button className="btn">Search</button>
      </form>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {listings.map(l => (
          <Link key={l.id} href={`/listing/${l.id}`} className="card space-y-2">
            <div className="aspect-square w-full overflow-hidden rounded">
              {l.images[0] ? (
                <Image alt={l.title} src={l.images[0]} width={600} height={600} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-sm">No image</div>
              )}
            </div>
            <div className="text-sm">{l.title}</div>
            <div className="font-semibold">₦{(l.priceCents/100).toLocaleString()}</div>
          </Link>
        ))}
      </div>
      {listings.length === 0 && <div>No items yet. Be the first to <Link href="/sell" className="underline">list something</Link>.</div>}
    </div>
  );
}

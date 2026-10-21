import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ListingForm from "@/components/listing-form";
import { updateListing } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") redirect("/");
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: { location: true, images: { orderBy: { position: "asc" } } },
  });
  if (!property) notFound();
  if (property.agentId !== session.user.id && session.user.role !== "ADMIN") redirect("/dashboard");

  const boundAction = updateListing.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Edit listing</h1>
      <p className="mt-1 text-slate-500">Edits are re-submitted for review.</p>
      <div className="mt-8">
        <ListingForm
          action={boundAction}
          initial={{
            title: property.title,
            description: property.description,
            listingType: property.listingType,
            propertyType: property.propertyType,
            price: String(property.price),
            pricePeriod: property.pricePeriod,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            sizeSqft: property.sizeSqft,
            sizeAcres: property.sizeAcres,
            hasTitleDeed: property.hasTitleDeed,
            county: property.location?.county ?? "Nairobi",
            town: property.location?.town ?? "",
            address: property.address,
            amenities: property.amenities,
            images: property.images.map((i) => i.url),
          }}
        />
      </div>
    </div>
  );
}

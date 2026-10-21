import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ListingForm from "@/components/listing-form";
import { createListing } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">New listing</h1>
      <p className="mt-1 text-slate-500">
        Provide accurate details and clear photos. Listings appear after review.
      </p>
      <div className="mt-8">
        <ListingForm action={createListing} />
      </div>
    </div>
  );
}

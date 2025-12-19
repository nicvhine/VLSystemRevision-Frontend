import BorrowerDetailClient from "./BorrowerDetailClient";

export default function Page({ params }: { params: any }) {
  return <BorrowerDetailClient borrowersId={params.borrowersId} />;
}

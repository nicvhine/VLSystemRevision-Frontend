import LoansDetailClient from "./loansDetailClient";

export default function Page({ params }: { params: any }) {
  return <LoansDetailClient loanId={params.id} />;
}

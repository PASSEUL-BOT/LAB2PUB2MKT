import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <EmptyState
      title="Not found"
      description="The page or record you're looking for doesn't exist or may have been removed."
      action={
        <Link href="/">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      }
    />
  );
}

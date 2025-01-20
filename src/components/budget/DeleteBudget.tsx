'use client';

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function DeleteBudget({ id }: { id: string }) {
  const utils = api.useUtils();
  const [loading, setLoading] = useState(false);
  const deleteBudget = api.account.deleteBudget.useMutation({
    onSuccess: (data) => {
      if (data.result.includes("Deleted")) {
        toast.success(data.result, { duration: 1000 });
        setLoading(false);
        utils.invalidate();
      } else {
        toast.error(data.result, { duration: 1000 });
        setLoading(false);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`, { duration: 2000 });
      setLoading(false);
    },
  });

  function handleDelete() {
    setLoading(true);
    deleteBudget.mutate(id);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={loading}
          variant="destructive"
          className="m-1 h-full py-1"
          aria-label="Delete Budget"
        >
          <Trash2 size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the budget.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

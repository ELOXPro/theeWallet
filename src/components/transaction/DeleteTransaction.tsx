"use client";

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

export function DeleteTransaction({ id }: { id: string }) {
  const utils = api.useUtils();
  const [loading, setLoading] = useState(false);
  const deleteTransaction = api.transaction.delete.useMutation({
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
  });

  function handleDelete() {
    setLoading(true);
    deleteTransaction.mutate(id);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={loading ? true : false}
          variant="destructive"
          className="m-1 h-full py-1"
        >
          <Trash2 size={6} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently Delete the
            Transaction.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
import { XCircle } from "lucide-react";
import { signOut } from "next-auth/react";

export function DeleteUser({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const deleteUser = api.user.delete.useMutation({
    onSuccess: async (data) => {
      if (data.result.includes("Terminated")) {
        toast.info(data.result, { duration: 1000 });
        setLoading(false);
        await signOut();
        window.location.href = "/signin";
      } else {
        toast.error(data.result, { duration: 1000 });
        setLoading(false);
      }
    },
  });

  function handleDelete() {
    setLoading(true);
    deleteUser.mutate(id);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={loading} variant="destructive">
          <XCircle size={16} /> Delete Your Wallet
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            wallet and you will lose access to your data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 text-white"
            disabled={loading}
          >
            {loading ? "Terminating..." : "Terminate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

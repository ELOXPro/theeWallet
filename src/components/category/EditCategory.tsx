"use client";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import { Label } from "../ui/label";

interface SignUpFormProps {
  userId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  id: string;
}

export function EditCategory({ id, userId }: { userId: string; id: string }) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  if (width >= 768) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Edit size={24} />
            <h1>Rename Category</h1>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Category</DialogTitle>
          </DialogHeader>
          <ProfileForm userId={userId} id={id} setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full">
          <Edit size={24} />
          <h1>Rename Category</h1>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Rename Category</DrawerTitle>
        </DrawerHeader>
        <ProfileForm userId={userId} id={id} setOpen={setOpen} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({ setOpen, id }: SignUpFormProps) {
  const utils = api.useUtils();
  const { data: category } = api.user.loadCategory.useQuery(id);

  const updateCategory = api.user.editCategory.useMutation({
    onSuccess: (data) => {
      if (data.result.includes("Updated")) {
        toast.success(data.result, { duration: 1000 });
        setLoading(false);
        setOpen(false);
        void utils.invalidate();
      } else {
        toast.error(data.result, { duration: 1000 });
        setLoading(false);
      }
    },
  });
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(category?.name ?? "");

  function onSubmit() {
    if (name.length < 2) {
      toast.error("Name must be above 2 Characters", { duration: 1000 });
      return;
    }
    setLoading(true);
    const fields = {
      name: name,
      id,
    };
    console.log(fields);
    void updateCategory.mutate(fields);
  }

  return (
    <div className="w-full space-y-4 overflow-auto p-2">
      <Label>New Category Name</Label>
      <Input
        placeholder="Enter Account Name"
        onChange={(e) => setName(e.target.value)}
      />
      <Button onClick={onSubmit} className="w-full" type="submit" disabled={loading ? true : false}>
        {loading ? "Renaming..." : "Rename"}
      </Button>
    </div>
  );
}

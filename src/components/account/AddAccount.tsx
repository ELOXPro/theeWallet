'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";

interface SignUpFormProps {
  userId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  balance: z.coerce.number(),
});

export function AddAccount({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);

  // Adjust layout based on window width
  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  // Conditional rendering for Dialog or Drawer based on screen size
  if (width >= 768) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={"outline"} className="w-full">
            <Plus size={24} />
            <h1>New Account</h1>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
            <DialogDescription>Create a New Account.</DialogDescription>
          </DialogHeader>
          <ProfileForm userId={userId} setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full">
          <Plus size={24} />
          <h1>New Account</h1>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add New Account</DrawerTitle>
          <DrawerDescription>Create a New Account.</DrawerDescription>
        </DrawerHeader>
        <ProfileForm userId={userId} setOpen={setOpen} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({ userId, setOpen }: SignUpFormProps) {
  const utils = api.useUtils();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      balance: 0,
    },
  });

  const createAccount = api.account.create.useMutation({
    onSuccess: (data) => {
      if (data.result.includes("Created")) {
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    const fields = {
      name: values.name,
      balance: values.balance,
      userId: userId,
    };
    void createAccount.mutate(fields);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4 p-2 overflow-auto">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Account Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter Account Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="balance" render={({ field }) => (
          <FormItem>
            <FormLabel>Account Default Balance</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter Balance" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button disabled={loading} type="submit">{loading ? "Creating..." : "Submit"}</Button>
      </form>
    </Form>
  );
}

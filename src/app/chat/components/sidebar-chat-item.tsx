"use client";

import { useDeleteChat, useUpdateChat } from "@/app/queries/chat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDeleteModal from "./confirm-delete-modal";

type Chat = {
  id: string;
  title: string;
};

export default function ChatItem({ chat }: { chat: Chat }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(chat.title);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const edit = useUpdateChat(chat.id);

  const del = useDeleteChat(chat.id);

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (value.trim() !== chat.title) {
            edit.mutate(value, { onSuccess: () => setEditing(false) });
          } else {
            setEditing(false);
          }
        }}
        className="flex-1 rounded-[24px] px-2 py-2 text-sm bg-background border"
      />
    );
  }

  return (
    <>
      <div
        className="group flex items-center justify-between 
      px-2 rounded-[24px] cursor-pointer"
        onClick={() => router.push(`/chat/${chat.id}`)}
        onDoubleClick={() => setEditing(true)}
      >
        <span className="truncate text-sm">{chat.title}</span>

        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            onClick={(e) => {
              e.stopPropagation(); // prevent navigation
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="py-1">
            <DropdownMenuItem
              onSelect={() => {
                setEditing(true);
              }}
            >
              Edit title
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => setShowDeleteModal(true)}
            >
              Delete chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showDeleteModal && (
        <ConfirmDeleteModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            del.mutate();
            setShowDeleteModal(false);
          }}
        />
      )}
    </>
  );
}

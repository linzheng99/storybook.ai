import { BookOpen, File } from "lucide-react";

import { Button } from "./ui/button";

export default function Header() {
  return (
    <div className="p-10 flex justify-center items-center relative">
      <div className="text-2xl font-bold">
        Story Builder AI
      </div>
      <div className="absolute top-2 right-2 flex gap-2">
        <Button size="icon" variant="outline" className="">
         <File className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="outline" className="">
         <BookOpen className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

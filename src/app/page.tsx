import StoryWriter from "@/components/story-writer";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col p-10">
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex-1 flex flex-col space-y-5 justify-center items-center order-1 lg:-order-1 bg-purple-500 rounded-md">
          <h1>Story Builder AI</h1>
          <Button>
            Explore Stories
          </Button>
        </div>
        <div className="flex-1">
          <StoryWriter />
        </div>
      </section>
    </main>
  );
}

import { RunEventType, type RunOpts } from '@gptscript-ai/gptscript';
import { type NextRequest } from "next/server";

import gpt from '@/lib/gpt';

const script = 'src/app/api/run-script/story-book.gpt'

export async function POST(request: NextRequest) {
  const { story, page, path } = await request.json();
  const opts: RunOpts = {
    disableCache: true,
    input: `--story ${story} --page ${page} --path ${path}`,
  }
  try {
    const encoder = new TextEncoder();
    console.log('encoder------->', encoder)
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const run = await gpt.run(script,opts);

          run.on(RunEventType.Event, (data) => {
            console.log('listent on event------->', data)
            console.log('listent on event type------->', data.type)
            controller.enqueue(encoder.encode(
              `event: ${JSON.stringify(data)}\n\n`
            ));
          })
          await run.text()
          controller.close()
        } catch (error) {
          controller.error(error);
          console.error('Error running script', error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}

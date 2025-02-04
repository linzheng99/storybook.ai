"use client";

import { type Frame } from "@gptscript-ai/gptscript";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import renderEventMessage from "./renderEventMessage";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const storiesPath = 'public/stories'

export default function StoryWriter() {
  const [story, setStory] = useState<string>('');
  const [page, setPage] = useState<string>('');
  const [progress, setProgress] = useState<string>('');
  const [runStarted, setRunStarted] = useState<boolean>(false);
  const [runFinished, setRunFinished] = useState<boolean | null>(null);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [events, setEvents] = useState<Frame[]>([]);

  const handleGenerateStory = async () => {
    setRunStarted(true);
    setRunFinished(false);

    const response = await fetch('/api/run-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ story, page, path: storiesPath }),
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      handleStream(reader, decoder);

    } else {
      setRunFinished(true);
      setRunStarted(false);
      setProgress('生成失败');
    }
  }

  async function handleStream(reader: ReadableStreamDefaultReader<Uint8Array>, decoder: TextDecoder) {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      console.log('chunk------->', chunk)

      const eventData = chunk
        .split('\n\n')
        .filter((line) => line.startsWith('event:'))
        .map((line) => line.replace(/^event: /, ''));

      console.log('eventData------->', eventData)

      eventData.forEach((data) => {
        try {
          const parsedData = JSON.parse(data);
          console.log('parsedData------->', parsedData)
          if (parsedData.type === 'callProgress') {
            setProgress(parsedData.output[parsedData.output.length - 1].content);
            setCurrentTool(parsedData.tool?.description || '');
          } else if (parsedData.type === 'callStart') {
            setCurrentTool(parsedData.tool?.description || '');
          } else if (parsedData.type === 'runFinished') {
            setRunFinished(true);
            setRunStarted(false);
          } else {
            setEvents((prevEvents) => [...prevEvents, parsedData]);
          }
        } catch (error) {
          
        }
      })
    }
  }

  return (
    <div className="flex flex-col w-full gap-5 h-full">
      <section className="flex flex-col gap-5 border p-5 rounded-md">
        <Textarea placeholder="Write your story here..." rows={3} value={story} onChange={(e) => setStory(e.target.value)} />
        <Select value={page} onValueChange={setPage}>
          <SelectTrigger>
            <SelectValue placeholder="Select a story page" />
          </SelectTrigger>
          <SelectContent>
            {
              Array.from({ length: 10 }).map((_, index) => (
                <SelectItem key={index} value={`${index + 1}`}>
                  {index + 1} 页
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
        <Button disabled={!page || !story} variant="default" onClick={handleGenerateStory}>
          生成故事
        </Button>
      </section>
      <section className="flex-1 flex">
        <div className="flex flex-col-reverse w-full h-full space-y-2 bg-gray-800 rounded-md p-10 overflow-y-auto font-mono text-gray-200">
          {/* 运行状态 */}
          <div>
            {
              runFinished && (
                <>
                  <p className="mr-5 animate-pulse">我正在为你写一个上面的故事...</p>
                  <br />
                </>
              )
            }

            <span className="mr-5">{">>"}</span>
            {progress}
          </div>
          {/* 当前工具 */}
          {
            currentTool && (
              <div className="py-10">
                <span className="mr-5">{"--- [Current Tool] ---"}</span>
                {currentTool}
              </div>
            )
          }

          <div className="space-y-5">
            {
              events.map((event, index) => (
                <div key={index}>
                  <span className="mr-5">{">>"}</span>
                  {renderEventMessage(event)}
                </div>
              ))
            }
          </div>

          {/* 运行开始 */}
          {
            runStarted && (
              <div>
                <div className="mr-5 animate-in">
                  <span className="mr-5">{"--- [Run Started] ---"}</span>
                  <br />
                </div>
              </div>
            )
          }
        </div>
      </section>
    </div>
  )
}

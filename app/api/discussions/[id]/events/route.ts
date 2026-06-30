function encodeSse(event: string, data: unknown): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        encodeSse("connected", {
          discussionId: id,
          connectedAt: new Date().toISOString()
        })
      );

      const heartbeat = setInterval(() => {
        controller.enqueue(
          encodeSse("heartbeat", {
            discussionId: id,
            at: new Date().toISOString()
          })
        );
      }, 15_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}

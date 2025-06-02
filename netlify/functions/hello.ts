// netlify/functions/hello.ts
import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

console.log("[HELLO_TS_TOP] hello.ts top level execution.");

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log("[HELLO_HANDLER] Hello handler invoked.");
  console.log("[HELLO_HANDLER] Event path:", event.path);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from the simple hello function!", path: event.path }),
    headers: {
      "Content-Type": "application/json"
    }
  };
};

export { handler };

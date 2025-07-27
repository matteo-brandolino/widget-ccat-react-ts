# React Chat Widget 🐱

React chat widget for the Cheshire Cat, ready to be used on any website.

## Installation

You can install the widget via npm:

```bash
npm install @cheshire-cat-ai/widget-react
```

Or using yarn:

```bash
yarn add @cheshire-cat-ai/widget-react
```

## How to import

Import the component and styles in your React application:

```jsx
import { CheshireCatChat } from "@cheshire-cat-ai/widget-react";
import "@cheshire-cat-ai/widget-react/dist/style.css";

function App() {
  return (
    <div className="w-96 h-96 m-auto">
      <CheshireCatChat />
    </div>
  );
}
```

## Props

The widget accepts various props for configuration. Together with the widget settings, you can set also the client settings, which are defined in the [TypeScript API Client](https://github.com/cheshire-cat-ai/api-client-ts#client-settings).

The available widget props are:

|    Prop     |      Type      |                                                    Default value                                                     |                                     Description                                      |
| :---------: | :------------: | :------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------: |
|    dark     |    Boolean     |                                                       `false`                                                        |            `true` if the chat have to use the dark mode. `false` if not.             |
|     why     |    Boolean     |                                                       `false`                                                        | `true` if the chat have to show the WHY button in the CCat response. `false` if not. |
|  thinking   |     String     |                                            `Cheshire Cat is thinking...`                                             |               The text to visualize while the CCat answer is loading.                |
| placeholder |     String     |                                              `Ask the Cheshire Cat...`                                               |                   The text to visualize in the input placeholder.                    |
|    user     |     String     |                                                        `user`                                                        |                        The user ID to pass to the cat via WS.                        |
|   primary   |     String     |                                                      `#F3977B`                                                       |                        The color to use to stylize the chat.                         |
|  callback   |    Function    |                                                     `undefined`                                                      |             The function to call before passing the message to the cat.              |
|   prompt    | PromptSettings |        **Check** [PromptSettings](https://github.com/cheshire-cat-ai/api-client-ts/blob/main/api/utils.ts#L3)        |            The prompt settings to pass to the cat for each user message.             |
|  defaults   |    String[]    | **Check** [defaultMessages](https://github.com/cheshire-cat-ai/widget-react/blob/main/src/stores/useMessages.ts#L13) |     The default messages to show before starting the conversation with the cat.      |
|  features   |   Feature[]    |           **Check** [Features](https://github.com/cheshire-cat-ai/widget-react/blob/main/src/config.ts#L6)           |                         The features that the user can use.                          |
|   authKey   |     String     |                                                     `undefined`                                                      |                     Authentication key for the Cheshire Cat API.                     |
|   baseUrl   |     String     |                                                     `localhost`                                                      |                          Base URL of the Cheshire Cat API.                           |
|    port     |     String     |                                                        `1865`                                                        |                            Port of the Cheshire Cat API.                             |
|     ws      |     Object     |                                                         `{}`                                                         |                           WebSocket configuration options.                           |
|    files    |    String[]    |                                                         `[]`                                                         |                           Accepted file types for upload.                            |

## Usage Example

```jsx
import React from "react";
import { CheshireCatChat } from "@cheshire-cat-ai/widget-react";
import "@cheshire-cat-ai/widget-react/dist/style.css";

function App() {
  const handleMessage = (message) => {
    console.log("Callback called.");
    return `Let's have a chat. ${message}`;
  };

  const handleWebSocketError = (error) => {
    console.log(error.description);
  };

  return (
    <div className="w-96 h-96 m-auto">
      <CheshireCatChat
        authKey="meow"
        baseUrl="localhost"
        port="1865"
        user="user"
        ws={{
          onFailed: handleWebSocketError,
        }}
        callback={handleMessage}
        defaults={[
          "Is everything ok?",
          "Who are you?",
          "What time is it?",
          "What's up?",
          "Hello Cheshire Cat!",
        ]}
        features={["record", "web", "file", "reset"]}
        files={["text/plain", "application/pdf", "text/markdown"]}
        dark={false}
        why={true}
        primary="#F3977B"
      />
    </div>
  );
}

export default App;
```

## Event Handlers

You can handle various events by passing callback props:

```jsx
import React from "react";
import { CheshireCatChat } from "@cheshire-cat-ai/widget-react";

function App() {
  const handleMessage = (message) => {
    console.log("Message:", message.text);
  };

  const handleUpload = (content) => {
    console.log(
      "Uploaded content:",
      content instanceof File ? content.name : content
    );
  };

  const handleNotification = (notification) => {
    console.log("Notification:", notification.text);
  };

  return (
    <div className="w-96 h-96 m-auto">
      <CheshireCatChat
        onMessage={handleMessage}
        onUpload={handleUpload}
        onNotification={handleNotification}
      />
    </div>
  );
}
```

The available event handlers are:

| Event Handler  | Parameter         | Description                                                                     |
| -------------- | ----------------- | ------------------------------------------------------------------------------- |
| onMessage      | `Message`         | Called every time a new message is dispatched.                                  |
| onUpload       | `File` / `string` | Called every time content is uploaded. It can be either a file object or a url. |
| onNotification | `Notification`    | Called every time a new notification is dispatched.                             |

## TypeScript Support

The widget is built with TypeScript and provides full type support. Import the types you need:

```tsx
import {
  CheshireCatChat,
  Message,
  Notification,
  PromptSettings,
  Feature,
} from "@cheshire-cat-ai/widget-react";
```

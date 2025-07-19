import { useEffect } from "react";
import { CheshireCatWidget } from "widget-ccat-react-ts";
import { loadHighlightCss } from "./utils/loadHighlightCss";

function App() {
  useEffect(() => {
    loadHighlightCss();
  }, []);

  return (
    <>
      <h1 className="chat-title">Cat ready to hack!</h1>
      <CheshireCatWidget host="localhost" />
    </>
  );
}

export default App;

import { invoke } from "@tauri-apps/api/tauri";
import { useEffect } from "preact/hooks";

function App() {
  async function greet() {
    await invoke("hello_world");
  }

  useEffect(() => {
    greet();
  }, [])

  return (
    <div>
      Hello world!
    </div>
  );
}

export default App;

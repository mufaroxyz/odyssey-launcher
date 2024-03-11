import { invoke } from "@tauri-apps/api/tauri";
import { useEffect } from "preact/hooks";
import { Button } from "../components/ui/button";

function App() {
  async function greet() {
    await invoke("hello_world");
  }

  useEffect(() => {
    greet();
  }, [])

  return (
    <div class={"flex flex-col h-full justify-between"}>
      <div class={"flex-1 p-2"}>
        <h3 class="bg-none text-white">Genshin Impact{" "} 
          <span class="text-accent">
            Loader
          </span>
        </h3>
      </div>
      <div class={"p-4 flex gap-2 self-end"}>
        <Button variant="tonal" label="Greet" class={"!w-fit"} onClick={greet}>Configure</Button>
        <Button variant="filled" label="Greet" class={"!w-fit"} onClick={greet}>Launch Game</Button>
      </div>
    </div>
  );
}

export default App;

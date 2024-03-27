import "./App.css";
import { Viewer } from "./components/Viewer";

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="h-full w-full flex flex-col items-stretch gap-0">
        <div className="w-full p-5 flex flex-col items-center justify-center my-10 gap-2 max-xl:items-start">
          <h1 className="text-5xl font-extrabold ">roughlify</h1>
          <h2>
            make your SVG <em>rough</em>
          </h2>
        </div>
        <div className="w-full flex flex-row justify-center">
          <Viewer />
        </div>
      </div>
    </div>
  );
}

export default App;

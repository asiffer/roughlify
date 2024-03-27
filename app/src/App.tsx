import "./App.css";
import { Github } from "./components/Github";
import { Viewer } from "./components/Viewer";

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="h-full w-full flex flex-col items-stretch gap-0">
        <div className="w-full flex flex-row p-3">
          <a
            className="block h-8 w-8 text-primary hover:opacity-90"
            href="https://github.com/asiffer/roughlify"
          >
            <Github />
          </a>
        </div>
        <div className="w-full p-5 flex flex-col items-center justify-center gap-2 max-xl:items-start">
          <h1 className="text-5xl font-extrabold">roughlify</h1>
          <h2>
            make your SVG <em>rough</em> - (
            <a href="https://roughjs.com/">❤️ rough.js</a>)
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

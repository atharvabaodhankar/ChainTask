import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import TodoApp from "./components/TodoApp";

function App() {
  const [signer, setSigner] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <WalletConnect onConnected={setSigner} />
      {signer && <TodoApp signer={signer} />}
    </div>
  );
}

export default App;

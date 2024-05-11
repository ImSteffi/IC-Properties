import React, { useState, useEffect } from "react";
import {
  createActor,
  Property_backend,
} from "../../declarations/Property_backend";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

function App() {
  const [actor, setActor] = useState(Property_backend);
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!loggedIn) {
      setActor(Property_backend);
    }
  }, [loggedIn]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: process.env.II_URL,
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const agent = new HttpAgent({ identity });
          await agent.fetchRootKey();
          const newActor = createActor(
            process.env.CANISTER_ID_PROPERTY_BACKEND,
            { agent }
          );
          setActor(newActor);
          setLoggedIn(true);
        },
        onError: (error) => console.error("Login failed:", error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGreet = async () => {
    setLoading(true);
    try {
      const newGreeting = await actor.greet();
      setGreeting(newGreeting);
    } catch (error) {
      console.error("Error calling greet:", error);
      setGreeting("Failed to fetch greeting, please check if logged in.");
    }
    setLoading(false);
  };

  return (
    <main>
      <img src="logo2.svg" alt="DFINITY logo" />
      <br />
      <button onClick={handleLogin} disabled={loading}>
        {loading && !loggedIn ? "Logging in..." : "Login!"}
      </button>
      <br />
      <button onClick={handleGreet} disabled={loading || !loggedIn}>
        {loading ? "Fetching..." : "Click Me!"}
      </button>
      <section>{greeting && <p>{greeting}</p>}</section>
    </main>
  );
}

export default App;

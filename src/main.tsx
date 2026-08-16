import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider as BalancerProvider } from "react-wrap-balancer";

import "@fontsource-variable/inter";
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/500-italic.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";

createRoot(document.getElementById("root")!).render(
  <BalancerProvider>
    <App />
  </BalancerProvider>
);

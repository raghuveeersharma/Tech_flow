import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DomainPicker from "./components/DomainPicker";
import Workspace from "./components/Workspace";
import { getDomain } from "./data/domains";

// Deep links look like  #/data-science . No hash means "show the domain picker".
const readHash = () => {
  const id = window.location.hash.replace(/^#\/?/, "");
  return getDomain(id) ? id : null;
};

export default function App() {
  const [domainId, setDomainId] = useState(readHash);

  // Browser back/forward move between the picker and a domain.
  useEffect(() => {
    const onPop = () => setDomainId(readHash());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = useCallback((id) => {
    const url = id ? `#/${id}` : window.location.pathname + window.location.search;
    window.history.pushState(null, "", url);
    setDomainId(id);
  }, []);

  const domain = domainId ? getDomain(domainId) : null;

  return (
    <div className="h-dvh bg-slate-950">
      <AnimatePresence mode="wait" initial={false}>
        {domain ? (
          <motion.div
            key={domain.id}
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Workspace domain={domain} onBack={() => go(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="picker"
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <DomainPicker onPick={go} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

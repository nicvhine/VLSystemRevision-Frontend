import { useEffect } from "react";

export function useAgentValidation(appAgent: string, setAgentMissingError: (val: boolean) => void) {
    useEffect(() => {
        if (appAgent.trim()) {
            setAgentMissingError(false);
        }
    }, [appAgent, setAgentMissingError]);
}

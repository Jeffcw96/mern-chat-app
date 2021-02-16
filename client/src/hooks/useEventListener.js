import { useEffect, useRef } from 'react'

export default function useEventListener(eventType, handler) {
    const handlerRef = useRef(handler);

    //get the ref from the event function
    useEffect(() => {
        handlerRef.current = handler;
    })

    useEffect(() => {
        //get the actual ref from event function
        function internalHandler(e) {
            return handlerRef.current(e);
        }

        document.addEventListener(eventType, internalHandler);

        return () => document.removeEventListener(eventType, internalHandler);
    }, [eventType])
}

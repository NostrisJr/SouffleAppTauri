"use client"

import React, { useState, useEffect } from 'react';

type logItemProps = {
    type: string,
    content: string
}

function LogItem({ type, content }: logItemProps) {
    return (
        <li className={`${type === "message" ? "bg-s-bg-light" : "bg-s-purple"} p-1 w-full text-base font-body text-s-white flex gap-2 select-text`}>
            <p className="text-md uppercase whitespace-nowrap">{`${type} :`}</p>
            <p className="text-wrap overflow-hidden">{content}</p>
        </li>
    )
}


const Debugging = () => {
    const [logs, setLogs] = useState([["Greetings !", "You entered the realm of logs and bugs"]]);

    async function fetchData() {
        const event = await import("@tauri-apps/api/event");

        try {
            await event.listen('log', (event) => {
                // @ts-expect-error
                setLogs(prevLogs => [...prevLogs, [event.payload.type, event.payload.content]]);
                return;
            });
        } catch (error) {
            console.error("Error listening to log event:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className=" w-full h-screen items-start bg-s-bg-light flex flex-col">
            <ul className="w-full mt-4 overflow-y-auto overflow-x-clip flex-col rounded-md divide-s-bg-dark divide-y px-4">
                {logs.map((log, index) => (
                    <LogItem key={index} type={log[0]} content={log[1]} />
                ))}
            </ul>
        </div>
    );
};


export default Debugging;

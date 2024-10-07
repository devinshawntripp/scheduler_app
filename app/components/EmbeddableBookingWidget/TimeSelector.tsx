import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { useFetcher } from '@remix-run/react';

interface TimeSelectorProps {
    selectedDate: Date;
    onSelectTime: (time: string) => void;
    userId: string;
    selectedTime: string | null;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ selectedDate, onSelectTime, userId, selectedTime }) => {
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const fetcher = useFetcher();

    useEffect(() => {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        fetcher.load(`/api/available-times?date=${formattedDate}&userId=${userId}`);
    }, [selectedDate, userId]);

    useEffect(() => {
        if (fetcher.data && fetcher.data.availableTimes) {
            setAvailableTimes(fetcher.data.availableTimes);
        }
    }, [fetcher.data]);

    const formatTime = (time: string) => {
        return format(parse(time, 'HH:mm', new Date()), 'h:mm a');
    };

    return (
        <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Select a Time</h3>
            {fetcher.state === 'loading' ? (
                <p>Loading available times...</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {availableTimes.map((time) => (
                        <button
                            key={time}
                            onClick={() => onSelectTime(time)}
                            className={`btn btn-sm ${selectedTime === time ? 'btn-secondary' : 'btn-outline btn-secondary'} transition-all duration-300 ease-in-out hover:scale-105`}
                        >
                            {formatTime(time)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimeSelector;
import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { useFetcher } from '@remix-run/react';

interface TimeSelectorProps {
    selectedDate: Date;
    onSelectTime: (time: string) => void;
    userId: string;
    apiKey: string;
    selectedTime: string | null;
}

interface FetcherData {
    availableTimes?: string[];
    error?: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ selectedDate, onSelectTime, userId, apiKey, selectedTime }) => {
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetcher = useFetcher<FetcherData>();

    useEffect(() => {
        if (selectedDate) {
            setIsLoading(true);
            setError(null);
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            fetcher.load(`/api/available-times?date=${formattedDate}&userId=${userId}&apiKey=${apiKey}`);
        }
    }, [selectedDate, userId, apiKey]);

    useEffect(() => {
        console.log('fetcher.state', fetcher.state);
        console.log('fetcher.data', fetcher.data);
        if (fetcher.state === 'idle' && fetcher.data) {
            setIsLoading(false);
            if (fetcher.data.error) {
                setError(fetcher.data.error);
            } else if (fetcher.data.availableTimes) {
                setAvailableTimes(fetcher.data.availableTimes);
            }
        }
    }, [fetcher.state, fetcher.data]);

    const formatTime = (time: string) => {
        return format(parse(time, 'HH:mm', new Date()), 'h:mm a');
    };

    if (isLoading || fetcher.state === 'loading') {
        return <div className="text-center py-4">Loading available times...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    if (availableTimes.length === 0) {
        return <div className="text-center py-4">No available times for this date.</div>;
    }

    return (
        <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Select a Time</h3>
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
        </div>
    );
};

export default TimeSelector;
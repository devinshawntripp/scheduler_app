import React, { useState, useEffect, useRef } from 'react';
import { useFetcher } from '@remix-run/react';
import { format, parse } from 'date-fns';

interface Availability {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

interface AvailabilityManagerProps {
    availabilities: Availability[];
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityManager({ availabilities: initialAvailabilities }: AvailabilityManagerProps) {
    const [availabilities, setAvailabilities] = useState<Availability[]>(
        daysOfWeek.map((_, index) => {
            const existing = initialAvailabilities.find(a => a.dayOfWeek === index);
            return existing || { id: `temp-${index}`, dayOfWeek: index, startTime: '09:00', endTime: '17:00' };
        })
    );
    const [editingDay, setEditingDay] = useState<number | null>(null);
    const fetcher = useFetcher();
    const startTimeRefs = useRef<(HTMLInputElement | null)[]>(new Array(7).fill(null));
    const endTimeRefs = useRef<(HTMLInputElement | null)[]>(new Array(7).fill(null));

    useEffect(() => {
        if (fetcher.data && fetcher.data.availabilities) {
            setAvailabilities(daysOfWeek.map((_, index) => {
                const updated = fetcher.data.availabilities.find((a: Availability) => a.dayOfWeek === index);
                return updated || availabilities[index];
            }));
        }
    }, [fetcher.data]);

    const formatTime = (time: string) => {
        return format(parse(time, 'HH:mm', new Date()), 'h:mm a');
    };

    const handleEdit = (dayOfWeek: number) => {
        setEditingDay(dayOfWeek);
    };

    const handleSave = (dayOfWeek: number) => {
        const startTime = startTimeRefs.current[dayOfWeek]?.value || '09:00';
        const endTime = endTimeRefs.current[dayOfWeek]?.value || '17:00';
        const updatedAvailabilities = availabilities.map(a =>
            a.dayOfWeek === dayOfWeek ? { ...a, startTime, endTime } : a
        );
        setAvailabilities(updatedAvailabilities);
        setEditingDay(null);
        updateAvailabilities(updatedAvailabilities);
    };

    const copyAllAvailability = (fromDay: number) => {
        const fromAvailability = availabilities[fromDay];
        const updatedAvailabilities = availabilities.map(a =>
            a.dayOfWeek !== fromDay ? { ...a, startTime: fromAvailability.startTime, endTime: fromAvailability.endTime } : a
        );
        setAvailabilities(updatedAvailabilities);
        updateAvailabilities(updatedAvailabilities);
    };

    const updateAvailabilities = (updatedAvailabilities: Availability[]) => {
        fetcher.submit(
            { availabilities: JSON.stringify(updatedAvailabilities), action: 'updateAllAvailabilities' },
            { method: 'post', action: '/api/update-availability' }
        );
    };

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title text-primary">Availability</h2>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availabilities.map((availability, index) => (
                                <tr key={index}>
                                    <td>{daysOfWeek[index]}</td>
                                    <td>
                                        {editingDay === index ? (
                                            <input
                                                type="time"
                                                defaultValue={availability.startTime}
                                                className="input input-bordered input-sm"
                                                ref={el => startTimeRefs.current[index] = el}
                                            />
                                        ) : (
                                            formatTime(availability.startTime)
                                        )}
                                    </td>
                                    <td>
                                        {editingDay === index ? (
                                            <input
                                                type="time"
                                                defaultValue={availability.endTime}
                                                className="input input-bordered input-sm"
                                                ref={el => endTimeRefs.current[index] = el}
                                            />
                                        ) : (
                                            formatTime(availability.endTime)
                                        )}
                                    </td>
                                    <td>
                                        {editingDay === index ? (
                                            <button
                                                onClick={() => handleSave(index)}
                                                className="btn btn-primary btn-sm"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(index)}
                                                    className="btn btn-secondary btn-sm mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => copyAllAvailability(index)}
                                                    className="btn btn-accent btn-sm"
                                                >
                                                    Copy to All
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
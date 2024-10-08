import React, { useState } from 'react';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import SubmitButton from './SubmitButton';
import { useFetcher } from "@remix-run/react";

interface EmbeddableBookingWidgetProps {
    userId: string;
    apiKey: string;
}

const EmbeddableBookingWidget: React.FC<EmbeddableBookingWidgetProps> = ({ userId, apiKey }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [customerFirstName, setCustomerFirstName] = useState<string | null>(null);
    const [customerLastName, setCustomerLastName] = useState<string | null>(null);
    const [city, setCity] = useState<string | null>(null);
    const [state, setState] = useState<string | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const fetcher = useFetcher();

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
    };

    const handleSubmit = async () => {
        if (selectedDate && selectedTime) {
            const formData = new FormData();
            formData.append("apiKey", apiKey);
            formData.append("userId", userId);
            formData.append("date", selectedDate.toISOString().split('T')[0]);
            formData.append("time", selectedTime);
            formData.append("duration", "60"); // or however you're determining duration
            // formData.append("customerFirstName", customerFirstName); // Add these fields to your form
            // formData.append("customerLastName", customerLastName);
            // formData.append("city", city);
            // formData.append("state", state);
            // formData.append("address", address);
            // formData.append("description", description);

            fetcher.submit(formData, { method: "post", action: "/api/create-booking" });
        }
    };

    return (
        <div className="p-4" style={{ background: 'transparent' }}>
            <h2 className="text-2xl font-bold mb-4">Book an Appointment</h2>
            <DateSelector onSelectDate={handleDateSelect} selectedDate={selectedDate} />
            {selectedDate && (
                <TimeSelector
                    selectedDate={selectedDate}
                    onSelectTime={handleTimeSelect}
                    userId={userId}
                    apiKey={apiKey}
                    selectedTime={selectedTime}
                />
            )}
            {selectedDate && selectedTime && (
                <SubmitButton onSubmit={handleSubmit} />
            )}
            {fetcher.data && (
                <div className="mt-4">
                    {fetcher.data.success ? (
                        <p className="text-success">Booking created successfully!</p>
                    ) : (
                        <p className="text-error">{(fetcher.data?.error as string) || "An error occurred"}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmbeddableBookingWidget;
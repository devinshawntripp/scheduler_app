import React, { useState } from 'react';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import SubmitButton from './SubmitButton';
import { useFetcher } from "@remix-run/react";
import { sendEmailNotification } from "~/utils/email"; // Import the email notification function

interface EmbeddableBookingWidgetProps {
    userId: string;
    apiKey: string;
}

const EmbeddableBookingWidget: React.FC<EmbeddableBookingWidgetProps> = ({ userId, apiKey }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const fetcher = useFetcher();

    const handleDateSelect = (date: Date) => {
        console.log("Date selected:", date); // Add this line for debugging
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
            formData.append("date", selectedDate.toISOString());
            formData.append("time", selectedTime);

            fetcher.submit(formData, { method: "post", action: "/api/create-booking" });
        }
    };

    return (
        <div className="embeddable-booking-widget p-4 bg-base-200 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-primary mb-4">Book an Appointment</h2>
            <DateSelector onSelectDate={handleDateSelect} selectedDate={selectedDate} />
            {selectedDate && (
                <TimeSelector
                    selectedDate={selectedDate}
                    onSelectTime={handleTimeSelect}
                    userId={userId}
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
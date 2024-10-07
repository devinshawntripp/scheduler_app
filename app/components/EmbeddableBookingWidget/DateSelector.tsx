import React from 'react';
import { format, addDays } from 'date-fns';

interface DateSelectorProps {
    onSelectDate: (date: Date) => void;
    selectedDate: Date | null;
}

const DateSelector: React.FC<DateSelectorProps> = ({ onSelectDate, selectedDate }) => {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

    return (
        <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Select a Date</h3>
            <div className="flex flex-wrap gap-2">
                {dates.map((date) => (
                    <button
                        key={date.toISOString()}
                        onClick={() => onSelectDate(date)}
                        className={`btn btn-sm ${selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ? 'btn-primary' : 'btn-outline btn-primary'} transition-all duration-300 ease-in-out hover:scale-105`}
                    >
                        {format(date, 'MMM d')}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DateSelector;
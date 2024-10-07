import React from 'react';

interface SubmitButtonProps {
    onSubmit: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onSubmit }) => {
    return (
        <button
            onClick={onSubmit}
            className="btn btn-sm btn-accent transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
        >
            Book Appointment
        </button>
    );
};

export default SubmitButton;
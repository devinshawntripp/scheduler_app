import React from 'react';

interface SubmitButtonProps {
    onSubmit: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onSubmit }) => {
    return (
        <button
            onClick={onSubmit}
            className="btn btn-primary w-full"
        >
            Book Appointment
        </button>
    );
};

export default SubmitButton;
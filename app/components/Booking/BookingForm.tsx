import React, { useEffect, useState } from 'react';
import { ClientOnly } from '~/utils/clientOnly';
import {
  Form,
  useActionData,
  useNavigation,
  useFetcher,
  Link,
  useSubmit,
} from '@remix-run/react';
import Calendar from '../Calendar/Calendar';
import { ExtendedUser } from '~/types';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { APP_TIME_ZONE } from '~/config/app-config';

interface BookingFormProps {
  teamOwnerId: string;
}

interface EmployeesResponse {
  employees: ExtendedUser[];
}

export default function BookingForm({ teamOwnerId }: BookingFormProps) {
  return (
    <ClientOnly fallback={<p>Loading booking form...</p>}>
      <BookingFormContent teamOwnerId={teamOwnerId} />
    </ClientOnly>
  );
}

function BookingFormContent({ teamOwnerId }: BookingFormProps) {
  const [contractors, setContractors] = useState<ExtendedUser[]>([]);
  const [selectedContractor, setSelectedContractor] = useState('');
  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submissionMessage, setSubmissionMessage] = useState('');

  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const fetcher = useFetcher<EmployeesResponse>();
  const submit = useSubmit();

  const timeZone = APP_TIME_ZONE;

  useEffect(() => {
    if (teamOwnerId && fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load(`/api/employees?teamOwnerId=${teamOwnerId}`);
    }
  }, [teamOwnerId, fetcher]);

  useEffect(() => {
    if (fetcher.state === 'idle') {
      if (fetcher.data) {
        setIsLoading(false);
        if (Array.isArray(fetcher.data.employees)) {
          // Convert date strings back to Date objects
          const convertedEmployees = fetcher.data.employees.map(employee => ({
            ...employee,
            createdAt: new Date(employee.createdAt),
            updatedAt: new Date(employee.updatedAt),
          }));
          setContractors(convertedEmployees);
          setError(null);
        } else {
          setError('No employees data received');
        }
      } else if (fetcher.data === undefined) {
        setIsLoading(false);
        setError('Failed to fetch contractors');
      }
    } else if (fetcher.state === 'loading') {
      setIsLoading(true);
    }
  }, [fetcher]);

  const handleStartDateTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const localDate = parseISO(e.target.value);
    setStartDateTime(localDate);
    setEndDateTime(new Date(localDate.getTime() + 60 * 60 * 1000)); // Add 1 hour
  };

  const handleEndDateTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const localDate = parseISO(e.target.value);
    setEndDateTime(localDate);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionStatus('loading');
    const formData = new FormData(event.currentTarget);
    formData.append('teamOwnerId', teamOwnerId);

    // Format dates to ISO string in the app's timezone
    const formattedStartDateTime = formatInTimeZone(startDateTime, APP_TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
    const formattedEndDateTime = formatInTimeZone(endDateTime, APP_TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");

    formData.set('startDateTime', formattedStartDateTime);
    formData.set('endDateTime', formattedEndDateTime);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSubmissionStatus('success');
        setSubmissionMessage('Booking created successfully!');
      } else {
        setSubmissionStatus('error');
        setSubmissionMessage(result.error || 'Failed to create booking');
      }
    } catch (error) {
      setSubmissionStatus('error');
      setSubmissionMessage('An error occurred while creating the booking');
    }
  };

  // const handleCreateContractor = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   const formData = new FormData(event.currentTarget);
    
  //   try {
  //     const response = await fetch('/api/create-contractor', {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to create contractor');
  //     }

  //     const result = await response.json();
  //     if (result.success) {
  //       // Refresh the contractors list or add the new contractor to the existing list
  //       setContractors([...contractors, result.contractor]);
  //       // Clear the form or close the modal if you're using one
  //     } else {
  //       setError(result.error || 'Failed to create contractor');
  //     }
  //   } catch (error) {
  //     setError('An error occurred while creating the contractor');
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4 text-lg font-semibold">
          Loading contractors...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="alert alert-error mb-4">
          <span>Error: {error}</span>
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            setError(null);
            fetcher.load(`/api/employees?teamOwnerId=${teamOwnerId}`);
          }}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Form method="post" onSubmit={handleSubmit} className="space-y-4">
      {contractors.length === 0 ? (
        <div className="text-center py-4">
          <p className="mb-4">
            No contractors found. Would you like to create one?
          </p>
          <Link
            to="/create-contractor"
            className="btn btn-primary"
          >
            Create Contractor
          </Link>
        </div>
      ) : (
        <>
          <div className="form-control">
            <label htmlFor="contractor" className="label">
              <span className="label-text">Contractor</span>
            </label>
            <select
              id="contractor"
              name="contractorId"
              value={selectedContractor}
              onChange={(e) => setSelectedContractor(e.target.value)}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select a contractor</option>
              {contractors.map((contractor) => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.email}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="customerFirstName" className="label">
              <span className="label-text">Customer First Name</span>
            </label>
            <input
              type="text"
              id="customerFirstName"
              name="customerFirstName"
              value={customerFirstName}
              onChange={(e) => setCustomerFirstName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="customerLastName" className="label">
              <span className="label-text">Customer Last Name</span>
            </label>
            <input
              type="text"
              id="customerLastName"
              name="customerLastName"
              value={customerLastName}
              onChange={(e) => setCustomerLastName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="address" className="label">
              <span className="label-text">Address</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="city" className="label">
              <span className="label-text">City</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="state" className="label">
              <span className="label-text">State</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="description" className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="startDateTime" className="label">
              <span className="label-text">Start Date and Time</span>
            </label>
            <input
              type="datetime-local"
              id="startDateTime"
              name="startDateTime"
              value={format(startDateTime, "yyyy-MM-dd'T'HH:mm")}
              onChange={handleStartDateTimeChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="endDateTime" className="label">
              <span className="label-text">End Date and Time</span>
            </label>
            <input
              type="datetime-local"
              id="endDateTime"
              name="endDateTime"
              value={format(endDateTime, "yyyy-MM-dd'T'HH:mm")}
              onChange={handleEndDateTimeChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submissionStatus === 'loading'}
            className={`btn btn-primary w-full ${submissionStatus === 'loading' ? 'loading' : ''}`}
          >
            {submissionStatus === 'loading' ? 'Booking...' : 'Book Appointment'}
          </button>
          
          {submissionStatus === 'success' && (
            <div className="alert alert-success mt-2">{submissionMessage}</div>
          )}
          {submissionStatus === 'error' && (
            <div className="alert alert-error mt-2">{submissionMessage}</div>
          )}
          
          {selectedContractor && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">
                Contractor's Calendar
              </h3>
              <React.Suspense
                fallback={<div className="loading loading-spinner loading-lg"></div>}
              >
                <Calendar userId={selectedContractor} />
              </React.Suspense>
            </div>
          )}
        </>
      )}
    </Form>
  );
}

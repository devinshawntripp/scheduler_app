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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
        <p className="mt-4 text-lg font-semibold text-neon-blue">
          Loading contractors...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-neon-red text-lg font-semibold mb-4">Error: {error}</p>
        <button
          onClick={() => {
            setIsLoading(true);
            setError(null);
            fetcher.load(`/api/employees?teamOwnerId=${teamOwnerId}`);
          }}
          className="bg-neon-green text-black px-4 py-2 rounded hover:bg-neon-blue transition duration-300"
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
          <p className="mb-4 text-neon-blue">
            No contractors found. Would you like to create one?
          </p>
          <Link
            to="/create-contractor"
            className="bg-neon-green text-black px-4 py-2 rounded hover:bg-neon-blue transition duration-300"
          >
            Create Contractor
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label
              htmlFor="contractor"
              className="block text-neon-blue text-sm font-bold mb-2"
            >
              Contractor
            </label>
            <select
              id="contractor"
              name="contractorId"
              value={selectedContractor}
              onChange={(e) => setSelectedContractor(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
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
          <div className="mb-4">
            <label
              htmlFor="customerFirstName"
              className="block text-neon-blue text-sm font-bold mb-2"
            >
              Customer First Name
            </label>
            <input
              type="text"
              id="customerFirstName"
              name="customerFirstName"
              value={customerFirstName}
              onChange={(e) => setCustomerFirstName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="customerLastName"
              className="block text-neon-blue text-sm font-bold mb-2"
            >
              Customer Last Name
            </label>
            <input
              type="text"
              id="customerLastName"
              name="customerLastName"
              value={customerLastName}
              onChange={(e) => setCustomerLastName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-neon-blue text-sm font-bold mb-2"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="city"
              className="block text-neon-blue text-sm font-bold mb-2"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="state"
              className="block text-neon-blue text-sm font-bold mb-2"
            >
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-neon-blue text-sm font-bold mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="startDateTime"
              className="block text-neon-blue text-sm font-bold mb-2"
            >
              Start Date and Time
            </label>
            <input
              type="datetime-local"
              id="startDateTime"
              name="startDateTime"
              value={format(startDateTime, "yyyy-MM-dd'T'HH:mm")}
              onChange={handleStartDateTimeChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="endDateTime"
              className="block text-neon-blue text-sm font-bold mb-2"
            >
              End Date and Time
            </label>
            <input
              type="datetime-local"
              id="endDateTime"
              name="endDateTime"
              value={format(endDateTime, "yyyy-MM-dd'T'HH:mm")}
              onChange={handleEndDateTimeChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submissionStatus === 'loading'}
            className="bg-neon-green text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-neon-blue transition duration-300"
          >
            {submissionStatus === 'loading' ? 'Booking...' : 'Book Appointment'}
          </button>
          
          {submissionStatus === 'success' && (
            <p className="text-neon-green mt-2">{submissionMessage}</p>
          )}
          {submissionStatus === 'error' && (
            <p className="text-neon-red mt-2">{submissionMessage}</p>
          )}
          
          {selectedContractor && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-neon-green">
                Contractor's Calendar
              </h3>
              <React.Suspense
                fallback={<div className="text-neon-blue">Loading calendar...</div>}
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

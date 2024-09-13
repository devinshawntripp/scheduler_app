import React, { useEffect, useState } from 'react';
import { ClientOnly } from '~/utils/clientOnly';
import { Form, useActionData, useNavigation, useFetcher, Link } from '@remix-run/react';
import Calendar from '../Calendar/Calendar';
import { ExtendedUser } from '~/types';

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
  const [isClient, setIsClient] = useState(false);
  const [contractors, setContractors] = useState<ExtendedUser[]>([]);
  const [selectedContractor, setSelectedContractor] = useState('');
  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const fetcher = useFetcher<EmployeesResponse>();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (teamOwnerId) {
      console.log("Fetching contractors...");
      fetcher.load(`/api/employees?teamOwnerId=${teamOwnerId}`);
    }
  }, [teamOwnerId]);

  useEffect(() => {
    console.log("Fetcher state:", fetcher.state);
    console.log("Fetcher data:", fetcher.data);

    if (fetcher.state === "loading") {
      console.log("Fetcher is loading...");
    } else if (fetcher.state === "idle") {
      setIsLoading(false);
      if (fetcher.data) {
        if (fetcher.data.employees) {
          console.log("Employees data received:", fetcher.data.employees);
          setContractors(fetcher.data.employees.map(employee => ({
            ...employee,
            createdAt: new Date(employee.createdAt),
            updatedAt: new Date(employee.updatedAt)
          })));
        } else {
          console.log("No employees data in the response");
          setError("No employees data received");
        }
      } else if (fetcher.data === undefined) {
        console.log("Fetcher data is undefined");
        setError("Failed to fetch contractors");
      }
    }
  }, [fetcher.state, fetcher.data]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedContractor) newErrors.contractor = 'Please select a contractor';
    if (!customerFirstName.trim()) newErrors.customerFirstName = 'First name is required';
    if (!customerLastName.trim()) newErrors.customerLastName = 'Last name is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!dateTime) newErrors.dateTime = 'Date and time are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      fetcher.submit(
        {
          contractorId: selectedContractor,
          customerFirstName,
          customerLastName,
          address,
          city,
          state,
          description,
          dateTime: dateTime.toISOString(),
        },
        { method: "post", action: "/api/bookings" }
      );
    }
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
        <p className="mt-4 text-lg font-semibold text-neon-blue">Loading contractors...</p>
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
          <p className="mb-4 text-neon-blue">No contractors found. Would you like to create one?</p>
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
            <label htmlFor="contractor" className="block text-neon-blue text-sm font-bold mb-2">Contractor</label>
            <select
              id="contractor"
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
            <label htmlFor="customerFirstName" className="block text-neon-blue text-sm font-bold mb-2">Customer First Name</label>
            <input
              type="text"
              id="customerFirstName"
              value={customerFirstName}
              onChange={(e) => setCustomerFirstName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="customerLastName" className="block text-neon-blue text-sm font-bold mb-2">Customer Last Name</label>
            <input
              type="text"
              id="customerLastName"
              value={customerLastName}
              onChange={(e) => setCustomerLastName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="address" className="block text-neon-blue text-sm font-bold mb-2">Address</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="city" className="block text-neon-blue text-sm font-bold mb-2">City</label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="state" className="block text-neon-blue text-sm font-bold mb-2">State</label>
            <input
              type="text"
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-neon-blue text-sm font-bold mb-2">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="dateTime" className="block text-neon-blue text-sm font-bold mb-2">Date and Time</label>
            <input
              type="datetime-local"
              id="dateTime"
              value={dateTime.toISOString().slice(0, 16)}
              onChange={(e) => setDateTime(new Date(e.target.value))}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-neon-blue leading-tight focus:outline-none focus:shadow-outline focus:border-neon-green"
              required
            />
          </div>
          <button
            type="submit"
            disabled={navigation.state === 'submitting'}
            className="bg-neon-green text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-neon-blue transition duration-300"
          >
            {navigation.state === 'submitting' ? 'Booking...' : 'Book Appointment'}
          </button>
          {actionData?.error && <p className="text-neon-red mt-2">{actionData.error}</p>}
          {selectedContractor && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-neon-green">Contractor's Calendar</h3>
              <Calendar userId={selectedContractor} />
            </div>
          )}
        </>
      )}
    </Form>
  );
}
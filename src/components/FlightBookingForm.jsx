import React, { useState } from "react";
import { fetchAccessToken, fetchFlightOffers, createFlightOrder } from "../utils/api";

const FlightBookingForm = () => {
    const [formData, setFormData] = useState({
        origin: "",
        destination: "",
        departureDate: "",
        returnDate: "",
        adults: 1,
    });
    const [flightOffers, setFlightOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const [selectedFlight, setSelectedFlight] = useState(null); // State to store the selected flight details
    const [order, setOrder] = useState(null);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setFlightOffers([]);

        try {
            const { origin, destination, departureDate, returnDate, adults } = formData;
            const iataCodePattern = /^[A-Z]{3}$/;

            if (!iataCodePattern.test(origin) || !iataCodePattern.test(destination)) {
                setError("Please enter valid IATA codes for origin and destination (3 uppercase letters).");
                setLoading(false);
                return;
            }

            const accessToken = await fetchAccessToken();
            const flightOffersData = await fetchFlightOffers(accessToken, {
                originLocationCode: origin,
                destinationLocationCode: destination,
                departureDate,
                returnDate: returnDate || undefined,
                adults,
                currencyCode: "AUD",
            });

            setFlightOffers(flightOffersData);
        } catch (err) {
            setError("Error fetching flight offers. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Open modal with flight details
    const handleConfirmFlight = (index) => {
        const selected = flightOffers[index];
        setSelectedFlight(selected);
        setShowModal(true); // Show modal
    };

    // Handle flight order creation
    const handleBookingConfirm = async () => {
        try {
            const accessToken = await fetchAccessToken();
            const orderData = await createFlightOrder(accessToken, {
                data: {
                    type: "flight-orders",
                    flightOffers: [selectedFlight],
                    travelers: [
                        {
                            id: "1",
                            dateOfBirth: "1990-01-01",
                            name: { firstName: "John", lastName: "Doe" },
                            contact: { emailAddress: "john.doe@example.com" }
                        }
                    ],
                    payments: [
                        {
                            method: "creditCard",
                            cardNumber: "4111111111111111",
                            expiryDate: "12/24",
                            cardHolder: "John Doe"
                        }
                    ]
                }
            });
            console.log(orderData.data)
            setOrder(orderData.data)
            setShowModal(false)
            setShowConfirmationPopup(true)

        } catch (err) {
            console.log(err)
            setError("Error creating flight order. Please try again.");
        }
    };

    return (
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-center text-2xl font-bold mb-4">Flight Booking</h1>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                {error && <p className="text-red-500">{error}</p>}
                <label>
                    Origin (IATA Code):
                    <input
                        type="text"
                        name="origin"
                        value={formData.origin}
                        onChange={handleInputChange}
                        className="block w-full p-2 border border-gray-300 rounded mt-1"
                        required
                    />
                </label>
                <label>
                    Destination (IATA Code):
                    <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                        className="block w-full p-2 border border-gray-300 rounded mt-1"
                        required
                    />
                </label>
                <label>
                    Departure Date:
                    <input
                        type="date"
                        name="departureDate"
                        value={formData.departureDate}
                        onChange={handleInputChange}
                        className="block w-full p-2 border border-gray-300 rounded mt-1"
                        required
                    />
                </label>
                <label>
                    Return Date:
                    <input
                        type="date"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleInputChange}
                        className="block w-full p-2 border border-gray-300 rounded mt-1"
                    />
                </label>
                <label>
                    Adults:
                    <input
                        type="number"
                        name="adults"
                        value={formData.adults}
                        onChange={handleInputChange}
                        min="1"
                        className="block w-full p-2 border border-gray-300 rounded mt-1"
                        required
                    />
                </label>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Search Flights
                </button>
            </form>

            <div className="mt-6">
                {loading ? (
                    <p>Loading...</p>
                ) : flightOffers.length > 0 ? (
                    <table className="table-auto w-full border-collapse border border-gray-300 mt-4">
                        <thead>
                            <tr>
                                <th className="border p-2">Flight ID</th>
                                <th className="border p-2">Departure</th>
                                <th className="border p-2">Arrival</th>
                                <th className="border p-2">Price</th>
                                <th className="border p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flightOffers.map((offer, index) => (
                                <tr key={offer.id}>
                                    <td className="border p-2">{offer.id}</td>
                                    <td className="border p-2">{offer.itineraries[0].segments[0].departure.at}</td>
                                    <td className="border p-2">
                                        {offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.at}
                                    </td>
                                    <td className="border p-2">
                                        {offer.price.total} {offer.price.currency}
                                    </td>
                                    <td className="border p-2">
                                        <button
                                            onClick={() => handleConfirmFlight(index)}
                                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                        >
                                            Confirm
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No flight offers found.</p>
                )}
            </div>

            {/* Modal for Confirmation */}
            {showModal && (
                <div className="modal fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Confirm Flight Booking</h2>
                        <p><strong>Flight ID:</strong> {selectedFlight.id}</p>
                        <p><strong>Departure:</strong> {selectedFlight.itineraries[0].segments[0].departure.at}</p>
                        <p><strong>Arrival:</strong> {selectedFlight.itineraries[0].segments[selectedFlight.itineraries[0].segments.length - 1].arrival.at}</p>
                        <p><strong>Price:</strong> {selectedFlight.price.total} {selectedFlight.price.currency}</p>
                        <div className="mt-4 flex justify-between">
                            <button onClick={handleBookingConfirm} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Confirm Booking
                            </button>
                            <button onClick={() => setShowModal(false)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showConfirmationPopup && (
                <div className="modal fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Booking Confirmed</h2>
                        <p><strong>Order ID:</strong> {order.id}</p> {/* Display order ID */}
                        <p><strong>Flight ID:</strong> {order.flightOffers[0].id}</p> {/* Display Flight ID */}
                        <p><strong>Price:</strong> {order.flightOffers[0].price.total} {order.flightOffers[0].price.currency}</p> {/* Display Price */}
                        <button
                            onClick={() => setShowConfirmationPopup(false)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FlightBookingForm;

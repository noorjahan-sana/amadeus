import axios from "axios";

const AUTH_URL = process.env.REACT_APP_AUTH_URL;
const FLIGHT_OFFERS_URL = process.env.REACT_APP_FLIGHT_OFFERS_URL;
const CREATE_ORDER_URL = process.env.REACT_APP_CREATE_ORDER_URL;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;

// Fetch access token
export const fetchAccessToken = async () => {
    try {
        // Debugging log
        console.log("AUTH_URL:", AUTH_URL);

        // Prepare the data in application/x-www-form-urlencoded format
        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");
        params.append("client_id", CLIENT_ID);
        params.append("client_secret", CLIENT_SECRET);

        // Send the POST request with x-www-form-urlencoded
        const response = await axios.post(AUTH_URL, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        console.log("Access Token Response:", response); // Debugging

        // Return the access token from the response
        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error);
        throw new Error("Authentication failed.");
    }
};

// Fetch flight offers
export const fetchFlightOffers = async (accessToken, params) => {
    try {
        const response = await axios.get(FLIGHT_OFFERS_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params,
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching flight offers:", error);
        throw error;
    }
};

// Create flight order
export const createFlightOrder = async (accessToken, requestData) => {
    try {
        const response = await axios.post(CREATE_ORDER_URL, requestData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/vnd.amadeus+json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating flight order:", error);
        throw error;
    }
};

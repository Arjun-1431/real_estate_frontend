import SliderProject from "../sub-component/sliderprojects";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import Button from '@mui/material/Button';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Navbar from "../sub-component/navbar";
import { getApiUrl } from '../utils/api';
import { getMediaUrl } from '../utils/media';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const TEST_CHECKOUT_AMOUNT_RUPEES = 1;

function formatCurrency(value) {
    const amount = Number(value) || 0;
    const hasDecimals = !Number.isInteger(amount);

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: hasDecimals ? 2 : 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(true), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout.')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load Razorpay checkout.'));
        document.body.appendChild(script);
    });
}

export default function Checkout() {
    const [gallery, setGallery] = useState(null);
    const [selectedFlatId, setSelectedFlatId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isLoggedIn = user !== null;

    useEffect(() => {
        const id = localStorage.getItem('selectedFlatId');
        setSelectedFlatId(id);

        if (!id) {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!selectedFlatId) {
            return;
        }

        setIsLoading(true);
        axios.get(getApiUrl(`/persons/${selectedFlatId}`))
            .then((response) => {
                setGallery(response.data);
            })
            .catch((error) => {
                console.log('Error fetching gallery:', error);
                setGallery(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [selectedFlatId]);

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const handleCheckout = async () => {
        if (!gallery) {
            return;
        }

        setIsProcessing(true);

        try {
            const { data } = await axios.post(getApiUrl('/payments/create-order'), {
                flatId: gallery._id,
                amount: TEST_CHECKOUT_AMOUNT_RUPEES,
                currency: 'INR',
            });

            if (data.free) {
                throw new Error('Razorpay checkout requires a payable amount. Please use the minimum supported test amount.');
            }

            await loadRazorpayScript();

            if (!window.Razorpay) {
                throw new Error('Razorpay checkout is unavailable right now.');
            }

            const razorpayOptions = {
                key: data.keyId,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'Real Estate Project',
                description: `Checkout for ${gallery.flatlocation}`,
                order_id: data.order.id,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.mobile || '',
                },
                notes: {
                    flatId: String(gallery._id),
                    flatLocation: gallery.flatlocation || '',
                },
                theme: {
                    color: '#111827',
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                    },
                },
                handler: async (paymentResponse) => {
                    try {
                        const verifyResponse = await axios.post(
                            getApiUrl('/payments/verify'),
                            paymentResponse
                        );

                        if (!verifyResponse.data?.success) {
                            throw new Error('Payment verification failed.');
                        }

                        await Swal.fire({
                            icon: 'success',
                            title: 'Payment Successful',
                            text: 'Your Razorpay checkout was completed successfully.',
                            confirmButtonColor: '#111827',
                        });
                    } catch (error) {
                        await Swal.fire({
                            icon: 'error',
                            title: 'Verification Failed',
                            text: error.response?.data?.message || error.message || 'Payment verification failed.',
                            confirmButtonColor: '#111827',
                        });
                    } finally {
                        setIsProcessing(false);
                    }
                },
            };

            const razorpayInstance = new window.Razorpay(razorpayOptions);

            razorpayInstance.on('payment.failed', async (error) => {
                setIsProcessing(false);
                await Swal.fire({
                    icon: 'error',
                    title: 'Payment Failed',
                    text: error?.error?.description || 'The payment could not be completed.',
                    confirmButtonColor: '#111827',
                });
            });

            razorpayInstance.open();
        } catch (error) {
            setIsProcessing(false);
            await Swal.fire({
                icon: 'error',
                title: 'Checkout Failed',
                text: error.response?.data?.error || error.message || 'Unable to start checkout.',
                confirmButtonColor: '#111827',
            });
        }
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="flex min-h-[40vh] items-center justify-center px-4 pt-28 text-center text-lg font-medium text-gray-600">
                    Loading checkout...
                </div>
            </>
        );
    }

    if (!gallery) {
        return (
            <>
                <Navbar />
                <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 pt-28 text-center">
                    <p className="text-lg font-medium text-gray-900">No flat is selected for checkout.</p>
                    <Button variant="contained" onClick={() => navigate('/rentalflate')} style={{ background: 'black' }}>
                        Back to Rental Flats
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="mx-auto max-w-7xl px-4 pb-8 pt-28 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
                    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <p className="text-2xl font-bold text-gray-900">Booking Summary</p>
                        <p className="mt-2 text-sm text-gray-500 sm:text-base">
                            Review the selected flat before continuing to Razorpay checkout.
                        </p>

                        <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center">
                            <img
                                className="h-44 w-full rounded-2xl border object-cover object-center sm:h-28 sm:w-36"
                                src={getMediaUrl(gallery.imagesq)}
                                alt={gallery.flatlocation}
                            />
                            <div className="min-w-0 flex-1">
                                <h1 className="text-2xl font-semibold text-gray-900">{gallery.flatlocation}</h1>
                                <p className="mt-2 text-sm text-gray-500">
                                    {gallery.sqtfoot} sq ft • {gallery.beds} beds • {gallery.bedroom} baths
                                </p>
                                <p className="mt-3 text-2xl font-bold text-gray-900">{formatCurrency(gallery.pricing)}/month</p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 shadow-sm sm:p-6">
                        <p className="text-2xl font-bold text-gray-900">Checkout Details</p>
                        <p className="mt-2 text-sm text-gray-500 sm:text-base">
                            Razorpay does not support a true zero-value checkout. This test payment uses the minimum supported amount of INR 1.00.
                        </p>

                        <div className="mt-6 space-y-4 rounded-3xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(gallery.pricing)}</p>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-sm font-medium text-gray-600">Razorpay Test Charge</p>
                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(TEST_CHECKOUT_AMOUNT_RUPEES)}</p>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                                <p className="text-sm font-medium text-gray-900">Total Payable Now</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(TEST_CHECKOUT_AMOUNT_RUPEES)}</p>
                            </div>
                        </div>

                        <label htmlFor="marketing-updates" className="mt-6 mb-2 block text-sm font-medium text-gray-900">
                            Optional Preferences
                        </label>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Checkbox id="marketing-updates" value="allowExtraEmails" color="primary" />}
                                label="Send me updates and promotional offers by email."
                            />
                        </Grid>

                        {isLoggedIn ? (
                            <button
                                className="mt-6 w-full rounded-2xl bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                                onClick={handleCheckout}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Opening Razorpay...' : 'Pay with Razorpay'}
                            </button>
                        ) : (
                            <Button
                                onClick={handleLoginRedirect}
                                style={{ background: 'black', color: 'white', marginTop: '16px', width: '100%' }}
                            >
                                Log In to Continue
                            </Button>
                        )}
                    </section>
                </div>
            </div>

            <div style={{ marginTop: '3%' }}>
                <SliderProject />
            </div>
        </>
    );
}

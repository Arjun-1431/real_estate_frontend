import axios from 'axios';
import { useEffect, useState } from 'react';
import { getApiUrl } from '../utils/api';
import { getMediaUrl } from '../utils/media';

function formatCurrency(value) {
    const amount = Number(value) || 0;

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

export default function AllFlatsList() {
    const [galleries, setGalleries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios.get(getApiUrl('/allflatesfind'))
            .then((response) => {
                setGalleries(response.data);
            })
            .catch((error) => {
                console.log('Error fetching galleries:', error);
                setGalleries([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleCheckoutClick = (id) => {
        localStorage.setItem('selectedFlatId', id);
        window.location.href = '/checkout';
    };

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <p className="text-center text-base text-gray-500">Loading flats...</p>
            </div>
        );
    }

    return (
        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 pb-8 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">All Rental Flats</h1>
                <p className="text-sm text-gray-500 sm:text-base">
                    Browse available rental flats and continue to checkout when you find the right one.
                </p>
            </div>

            {galleries.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
                    <p className="text-base font-medium text-gray-700">No flats are available right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {galleries.map((gallery) => (
                        <article
                            key={gallery._id}
                            className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="relative h-56 overflow-hidden bg-gray-100">
                                {gallery.imagesq ? (
                                    <img
                                        src={getMediaUrl(gallery.imagesq)}
                                        alt={gallery.flatlocation}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                        No image available
                                    </div>
                                )}
                            </div>

                            <div className="space-y-5 p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-semibold text-gray-900">{gallery.flatlocation}</h2>
                                        <p className="mt-1 text-sm text-gray-500">A ready-to-book listing with verified details.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCheckoutClick(gallery._id)}
                                        className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
                                    >
                                        Book Now
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">Area</p>
                                        <p className="mt-1 font-semibold text-gray-800">{gallery.sqtfoot} sq ft</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">Beds</p>
                                        <p className="mt-1 font-semibold text-gray-800">{gallery.beds}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">Baths</p>
                                        <p className="mt-1 font-semibold text-gray-800">{gallery.bedroom}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Monthly Rent</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(gallery.pricing)}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-sm text-gray-400">Rating</p>
                                        <p className="text-lg font-semibold text-gray-900">{gallery.rating || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

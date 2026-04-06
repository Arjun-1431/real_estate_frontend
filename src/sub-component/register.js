import Swal from 'sweetalert2';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../utils/api';

export default function Register() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [role, setRole] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const namePattern = /^[a-zA-Z\s]+$/;
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const mobilePattern = /^[0-9]{10}$/;

        if (!name.match(namePattern)) {
            Swal.fire({
                title: 'Error!',
                text: 'Name can only contain letters and spaces',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }

        if (!email.match(emailPattern)) {
            Swal.fire({
                title: 'Error!',
                text: 'Please enter a valid email address',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }

        if (!mobile.match(mobilePattern)) {
            Swal.fire({
                title: 'Error!',
                text: 'Mobile number must be a 10-digit number',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }

        if (!name || !email || !password || !mobile || !role) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill in all fields',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }

        try {
            const response = await axios.post(getApiUrl('/register'), { name, email, password, mobile, role });

            if (response.data?.requiresVerification) {
                await Swal.fire({
                    title: 'Verification Sent',
                    text: response.data.message || 'Verification code sent to your email.',
                    icon: 'info',
                    confirmButtonText: 'Ok'
                });
                setVerificationId(response.data.verificationId || '');
                setOtpCode('');
                return;
            }

            await Swal.fire({
                title: 'Success!',
                text: 'Register successful',
                icon: 'success',
                confirmButtonText: 'Ok'
            });
            navigate('/login');
        } catch (error) {
            await Swal.fire({
                title: 'Error!',
                text: error.response?.data?.error || 'Register failed',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            console.error('Error registering user:', error);
        }
    };

    const handleVerifyRegister = async () => {
        if (!/^\d{4}$/.test(otpCode)) {
            await Swal.fire({
                title: 'Error!',
                text: 'Please enter a valid 4 digit code',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }

        try {
            await axios.post(getApiUrl('/register'), {
                verificationId,
                otp: otpCode,
            });

            setVerificationId('');
            setOtpCode('');
            await Swal.fire({
                title: 'Success!',
                text: 'Register successful',
                icon: 'success',
                confirmButtonText: 'Ok'
            });
            navigate('/login');
        } catch (error) {
            await Swal.fire({
                title: 'Error!',
                text: error.response?.data?.error || 'Verification failed',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            console.error('Error verifying registration:', error);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
                <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
                    <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
                        <div className="mt-12 flex flex-col items-center">
                            <h1 className="text-2xl xl:text-3xl font-extrabold">
                                Sign up
                            </h1>
                            <div className="w-full flex-1 mt-8">
                                <div className="my-12 border-b text-center">
                                    <div
                                        className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                                        Or sign up with e-mail
                                    </div>
                                </div>

                                <div className="mx-auto max-w-xs">
                                    {!verificationId && (
                                        <p className="rounded-md bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                                            After registration, a 4-digit verification code will be sent to your email.
                                        </p>
                                    )}
                                    <input
                                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                                        type="text"
                                        placeholder="Name"
                                        onChange={(e) => setName(e.target.value)}
                                        value={name}
                                        required
                                        pattern="[a-zA-Z\\s]+"
                                        title="Name can only contain letters and spaces"
                                        disabled={Boolean(verificationId)}
                                    />
                                    <input
                                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                                        type="email"
                                        placeholder="Email"
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
                                        required
                                        pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
                                        title="Please enter a valid email address"
                                        disabled={Boolean(verificationId)}
                                    />
                                    <input
                                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                                        type="tel"
                                        placeholder="Contact No."
                                        onChange={(e) => setMobile(e.target.value)}
                                        value={mobile}
                                        required
                                        pattern="[0-9]{10}"
                                        title="Mobile number must be a 10-digit number"
                                        disabled={Boolean(verificationId)}
                                    />

                                    <input
                                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                                        type="password"
                                        placeholder="Password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        value={password}
                                        required
                                        disabled={Boolean(verificationId)}
                                    />
                                    <select
                                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                                        onChange={(e) => setRole(e.target.value)}
                                        value={role}
                                        required
                                        disabled={Boolean(verificationId)}
                                    >
                                        <option value="">Select Role</option>
                                        <option value="tenant">Tenant</option>
                                    </select>
                                    {verificationId && (
                                        <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-left">
                                            <p className="text-sm font-semibold text-indigo-700">Email Verification</p>
                                            <p className="mt-1 text-sm text-indigo-700">
                                                A 4-digit code was sent to {email}. Your account will be created after verification.
                                            </p>
                                            <input
                                                className="mt-3 w-full rounded-lg border border-indigo-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
                                                type="text"
                                                placeholder="Enter 4 digit code"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            />
                                            <div className="mt-3 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyRegister}
                                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                                                >
                                                    Verify Code
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setVerificationId('');
                                                        setOtpCode('');
                                                    }}
                                                    className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-white"
                                                >
                                                    Change Email
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={handleSubmit}
                                        className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                        disabled={Boolean(verificationId)}>
                                        <svg className="w-6 h-6 -ml-2" fill="none" stroke="currentColor" strokeWidth="2"
                                            strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                            <circle cx="8.5" cy="7" r="4" />
                                            <path d="M20 8v6M23 11h-6" />
                                        </svg>
                                        <span className="ml-3">
                                            {verificationId ? 'Verification Pending' : 'Sign Up'}
                                        </span>
                                    </button>
                                    <div className="text-sm">
                                        <a href='/login' className="font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer">Already have an account</a>
                                    </div>
                                    <p className="mt-6 text-xs text-gray-600 text-center">
                                        I agree to abide by templatana's
                                        <a href="#" className="border-b border-gray-500 border-dotted">
                                            Terms of Service
                                        </a>
                                        and its
                                        <a href="#" className="border-b border-gray-500 border-dotted">
                                            Privacy Policy
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
                        <div
                            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
                            style={{
                                backgroundImage: `url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')`
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </>
    );
}

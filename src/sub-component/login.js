import Swal from 'sweetalert2';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../utils/api';

export default function Login({ setIsLoggedIn }) {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [resetPasswordMode, setResetPasswordMode] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (storedUser) {
            setIsLoggedIn(true);
        }
    }, [setIsLoggedIn]);

    const handleLoginSuccess = (user) => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('data1', user._id);
        setIsLoggedIn(true);
    };

    const completeLogin = async (user) => {
        const normalizedRole = typeof user?.role === 'string' ? user.role.toLowerCase() : '';
        const isAdminUser = Boolean(user?.isAdmin) || normalizedRole === 'admin';
        const isTenantUser = normalizedRole === 'tenant';

        handleLoginSuccess(user);

        if (isAdminUser) {
            await Swal.fire({
                title: 'Success!',
                text: 'Hello Admin! Login successful',
                icon: 'success',
                confirmButtonText: 'Ok',
            });
            navigate('/admindashboard');
            return;
        }

        if (isTenantUser) {
            await Swal.fire({
                title: 'Success!',
                text: 'Hello Tenant! Login successful',
                icon: 'success',
                confirmButtonText: 'Ok',
            });
            navigate('/', { state: { user: user._id } });
            return;
        }

        await Swal.fire({
            title: 'Success!',
            text: 'Hello User! Login successful',
            icon: 'success',
            confirmButtonText: 'Ok',
        });
        navigate('/', { state: { user: user._id } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(getApiUrl('/login/api/check'), { email, password });

            if (response.data?.requiresVerification) {
                await Swal.fire({
                    title: 'Verification Sent',
                    text: response.data.message || 'Verification code sent to your email.',
                    icon: 'info',
                    confirmButtonText: 'Ok',
                });
                setVerificationId(response.data.verificationId || '');
                setOtpCode('');
                return;
            }

            if (response.data?.user) {
                await completeLogin(response.data.user);
            }
        } catch (error) {
            await Swal.fire({
                title: 'Error!',
                text: error.response?.data?.error || error.response?.data?.message || 'Login failed',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
            console.error('Error logging in user:', error);
        }
    };

    const handleVerifyLogin = async (e) => {
        e.preventDefault();

        if (!/^\d{4}$/.test(otpCode)) {
            await Swal.fire({
                title: 'Error!',
                text: 'Please enter a valid 4 digit code',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
            return;
        }

        try {
            const verifyResponse = await axios.post(getApiUrl('/login/api/check'), {
                verificationId,
                otp: otpCode,
            });

            setVerificationId('');
            setOtpCode('');
            await completeLogin(verifyResponse.data.user);
        } catch (error) {
            await Swal.fire({
                title: 'Error!',
                text: error.response?.data?.error || 'Verification failed',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await axios.post(getApiUrl('/forget/api/pswforget'), { email, newPassword });
            await Swal.fire({
                title: 'Success!',
                text: 'Password reset successful',
                icon: 'success',
                confirmButtonText: 'Ok',
            });
            navigate('/login');
        } catch (error) {
            await Swal.fire({
                title: 'Error!',
                text: error.response?.data?.error || 'Password reset failed',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
            console.error('Error resetting password:', error);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
                <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <img className="mx-auto h-100 w-100" src={require('../Assets/logo1.png')} alt="Your Company" />
                        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign in to your account</h2>
                    </div>
                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
                                        disabled={Boolean(verificationId)}
                                    />
                                </div>
                            </div>
                            {!resetPasswordMode && !verificationId && (
                                <p className="rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
                                    After sign-in, a 4-digit verification code will be sent to your email.
                                </p>
                            )}
                            {resetPasswordMode ? (
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-gray-900">New Password</label>
                                    <div className="mt-2">
                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            value={newPassword}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
                                        <div className="text-sm">
                                            <a onClick={() => setResetPasswordMode(true)} className="font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer">Forgot password?</a>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            onChange={(e) => setPassword(e.target.value)}
                                            value={password}
                                            disabled={Boolean(verificationId)}
                                        />
                                    </div>
                                    <div className="text-sm">
                                        <a href='/register' className="font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer">Create an account</a>
                                    </div>
                                </div>
                            )}
                            {verificationId && !resetPasswordMode && (
                                <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                                    <p className="text-sm font-semibold text-indigo-700">Email Verification</p>
                                    <p className="mt-1 text-sm text-indigo-700">
                                        A 4-digit code was sent to {email}. Your login will continue after verification.
                                    </p>
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            placeholder="Enter 4 digit code"
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-indigo-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                    <div className="mt-3 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={handleVerifyLogin}
                                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                                        >
                                            Verify Code
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setVerificationId('');
                                                setOtpCode('');
                                            }}
                                            className="rounded-md border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-white"
                                        >
                                            Change Email
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div>
                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    onClick={resetPasswordMode ? handleResetPassword : handleSubmit}
                                    disabled={Boolean(verificationId) && !resetPasswordMode}
                                >
                                    {resetPasswordMode ? 'Reset Password' : 'Sign in'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

import React, { useState } from 'react';
import { createRazorpayOrder, verifyPayment } from '../../services/food';
import { FaSpinner, FaRupeeSign, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PaymentButton = ({ order, productName, amount, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      const paymentData = await createRazorpayOrder(order._id);
      
      const options = {
        key: paymentData.razorpayKey,
        amount: paymentData.amount * 100,
        currency: 'INR',
        name: 'Food Marketplace',
        description: `Purchase: ${productName}`,
        order_id: paymentData.razorpayOrderId,
        handler: async (response) => {
          const verificationData = {
            requestId: order._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          };
          
          const verifyResult = await verifyPayment(verificationData);
          if (verifyResult.success) {
            toast.success('Payment successful! Order confirmed.');
            if (onSuccess) onSuccess();
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
        },
        theme: {
          color: '#22c55e'
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
            setLoading(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Complete Payment</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaRupeeSign className="text-3xl text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Summary</h3>
            <p className="text-gray-600">Product: <span className="font-medium">{productName}</span></p>
            <p className="text-2xl font-bold text-green-600 mt-2">₹{amount}</p>
            <p className="text-xs text-gray-500 mt-1">Platform fee (20%): ₹{(amount * 0.2).toFixed(2)}</p>
          </div>
          
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaRupeeSign />}
            {loading ? 'Processing...' : `Pay ₹${amount}`}
          </button>
          
          <button onClick={onClose} className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentButton;